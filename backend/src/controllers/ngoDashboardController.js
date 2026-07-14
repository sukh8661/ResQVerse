import EmergencyRequest from "../models/EmergencyRequest.js";
import FundAllocation from "../models/FundAllocation.js";
import FundRequest from "../models/FundRequest.js";
import Resource from "../models/Resource.js";
import Volunteer from "../models/Volunteer.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";
import { broadcast } from "../utils/realtime.js";

function requireNgoProfile(req) {
  if (!req.profile?._id) {
    throw new ApiError(403, "NGO profile is required");
  }
  return req.profile;
}

async function buildDashboardPayload(ngo) {
  const [requests, liveRequests, volunteers, resources, allocations, fundRequests] = await Promise.all([
    EmergencyRequest.find({ assignedNgo: ngo._id }).sort({ updatedAt: -1 }).populate("assignedVolunteer"),
    EmergencyRequest.find({ status: "pending", assignedNgo: { $exists: false } }).sort({ urgency: 1, createdAt: -1 }),
    Volunteer.find({ ngo: ngo._id }).populate("user").sort({ verificationStatus: 1, createdAt: -1 }),
    Resource.find({ ngo: ngo._id }).sort({ type: 1 }),
    FundAllocation.find({ ngo: ngo._id }).populate("donation").sort({ createdAt: -1 }),
    FundRequest.find({ ngo: ngo._id }).populate("allocation").sort({ createdAt: -1 })
  ]);

  const assignedRequests = requests.filter((request) => request.assignedVolunteer);
  const activeRequests = requests.filter((request) => !["completed", "rejected"].includes(request.status));
  const totalFunds = allocations.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0);
  const availableUnits = resources.reduce((sum, resource) => sum + Number(resource.available || 0), 0);
  const distributedUnits = resources.reduce((sum, resource) => sum + Number(resource.distributed || 0), 0);

  return {
    ngo: toJSON(ngo),
    stats: {
      liveQueue: liveRequests.length,
      activeRequests: activeRequests.length,
      assignedRequests: assignedRequests.length,
      volunteers: volunteers.length,
      availableVolunteers: volunteers.filter((volunteer) => volunteer.status === "available").length,
      totalFunds,
      availableUnits,
      distributedUnits,
      pendingFundRequests: fundRequests.filter((request) => request.status === "pending").length,
      approvedFundRequests: fundRequests.filter((request) => ["approved", "partially_approved"].includes(request.status)).length
    },
    requests: listJSON(requests),
    liveRequests: listJSON(liveRequests),
    volunteers: volunteers.map((volunteer) => ({
      ...toJSON(volunteer),
      user: toJSON(volunteer.user),
      userId: volunteer.user?._id ? String(volunteer.user._id) : undefined
    })),
    resources: listJSON(resources),
    allocations: allocations.map((allocation) => ({
      ...toJSON(allocation),
      donation: toJSON(allocation.donation)
    })),
    fundRequests: fundRequests.map((request) => ({
      ...toJSON(request),
      allocation: toJSON(request.allocation)
    }))
  };
}

export const dashboard = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  res.json(await buildDashboardPayload(ngo));
});

export const createFundRequest = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const amountRequested = Number(req.body.amountRequested);
  if (!amountRequested || amountRequested <= 0 || !req.body.purpose) {
    throw new ApiError(400, "Amount and purpose are required");
  }

  const fundRequest = await FundRequest.create({
    ngo: ngo._id,
    requestedBy: req.user?._id,
    amountRequested,
    purpose: req.body.purpose,
    urgency: req.body.urgency || "medium",
    details: req.body.details || ""
  });

  broadcast("ngo_fund_request_created", { fundRequest: toJSON(fundRequest), ngo: toJSON(ngo) });
  res.status(201).json({ fundRequest: toJSON(fundRequest) });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Emergency request not found");
  if (request.assignedNgo && String(request.assignedNgo) !== String(ngo._id)) {
    throw new ApiError(409, "This request is already accepted by another NGO");
  }
  if (request.status === "rejected" || request.status === "completed") {
    throw new ApiError(400, "This request cannot be accepted");
  }

  request.assignedNgo = ngo._id;
  request.status = "accepted";
  request.progress.push({
    status: "accepted",
    note: `${ngo.organizationName} accepted the request`,
    createdBy: req.user._id
  });
  await request.save();
  broadcast("request_status_update", { request: toJSON(request) });
  res.json({ request: toJSON(request) });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const allowed = ["accepted", "started", "reached", "in_progress", "completed", "rejected"];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, "Invalid request status");

  const request = await EmergencyRequest.findOne({ _id: req.params.id, assignedNgo: ngo._id });
  if (!request) throw new ApiError(404, "Request not found for this NGO");

  request.status = req.body.status;
  request.progress.push({
    status: req.body.status,
    note: req.body.note || `NGO marked request as ${req.body.status}`,
    createdBy: req.user._id
  });

  if (req.body.status === "completed" && request.assignedVolunteer) {
    const volunteer = await Volunteer.findById(request.assignedVolunteer);
    if (volunteer) {
      volunteer.status = "available";
      volunteer.totalResponses += 1;
      volunteer.creditPoints += 25;
      await volunteer.save();
    }
  }

  await request.save();
  broadcast("request_status_update", { request: toJSON(request) });
  res.json({ request: toJSON(request) });
});

export const assignVolunteer = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const request = await EmergencyRequest.findOne({ _id: req.params.id, assignedNgo: ngo._id });
  if (!request) throw new ApiError(404, "Request not found for this NGO");

  const volunteer = await Volunteer.findOne({
    _id: req.body.volunteerId,
    ngo: ngo._id,
    verificationStatus: "verified"
  });
  if (!volunteer) throw new ApiError(404, "Verified volunteer not found for this NGO");

  request.assignedVolunteer = volunteer._id;
  request.status = "assigned";
  request.progress.push({
    status: "assigned",
    note: "Volunteer assigned by NGO",
    volunteer: volunteer._id,
    createdBy: req.user._id
  });
  volunteer.status = "assigned";

  await Promise.all([request.save(), volunteer.save()]);
  broadcast("request_status_update", { request: toJSON(request) });
  res.json({ request: toJSON(request), volunteer: toJSON(volunteer) });
});

export const createResource = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const quantity = Number(req.body.quantity);
  if (!req.body.type || !quantity || !req.body.unit) {
    throw new ApiError(400, "Type, quantity, and unit are required");
  }
  const resource = await Resource.create({
    type: req.body.type,
    quantity,
    available: quantity,
    distributed: 0,
    unit: req.body.unit,
    ngo: ngo._id
  });
  res.status(201).json({ resource: toJSON(resource) });
});

export const updateResource = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  const resource = await Resource.findOne({ _id: req.params.id, ngo: ngo._id });
  if (!resource) throw new ApiError(404, "Resource not found for this NGO");
  const amount = Number(req.body.amount || 0);
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than zero");

  if (req.body.action === "add") {
    resource.quantity += amount;
    resource.available += amount;
  } else if (req.body.action === "distribute") {
    if (amount > resource.available) throw new ApiError(400, "Not enough available stock");
    resource.available -= amount;
    resource.distributed += amount;
  } else {
    throw new ApiError(400, "Invalid stock action");
  }

  await resource.save();
  res.json({ resource: toJSON(resource) });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const ngo = requireNgoProfile(req);
  await Resource.deleteOne({ _id: req.params.id, ngo: ngo._id });
  res.status(204).end();
});
