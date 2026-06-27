import Donation from "../models/Donation.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import FundAllocation from "../models/FundAllocation.js";
import Ngo from "../models/Ngo.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";

export const overview = asyncHandler(async (_req, res) => {
  const [donations, allocations, ngos, volunteers, requests] = await Promise.all([
    Donation.find({ status: "successful" }).sort({ createdAt: -1 }),
    FundAllocation.find().sort({ createdAt: -1 }),
    Ngo.find().sort({ createdAt: -1 }),
    Volunteer.find(),
    EmergencyRequest.find()
  ]);

  const totalDonationAmount = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const allocatedAmount = allocations.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0);

  res.json({
    overview: {
      donations: donations.length,
      totalDonationAmount,
      allocatedAmount,
      unallocatedAmount: Math.max(totalDonationAmount - allocatedAmount, 0),
      ngos: ngos.length,
      volunteers: volunteers.length,
      pendingVolunteerApplications: volunteers.filter((item) => item.verificationStatus === "pending").length,
      requests: requests.length
    },
    donations: listJSON(donations),
    allocations: listJSON(allocations).map((allocation) => ({
      ...allocation,
      ngoId: allocation.ngo ? String(allocation.ngo) : undefined,
      donationId: allocation.donation ? String(allocation.donation) : undefined
    }))
  });
});

export const listNgos = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.verified === "true") filter.isVerified = true;
  const ngos = await Ngo.find(filter).sort({ isVerified: -1, createdAt: -1 });
  res.json({ ngos: listJSON(ngos) });
});

export const listVolunteerApplications = asyncHandler(async (_req, res) => {
  const applications = await Volunteer.find({ verificationStatus: "pending" }).populate("user").sort({ createdAt: -1 });
  res.json({
    applications: applications.map((application) => ({
      ...toJSON(application),
      user: toJSON(application.user)
    }))
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).populate("profileRef");
  res.json({
    users: users.map((user) => ({
      ...toJSON(user),
      profile: toJSON(user.profileRef)
    }))
  });
});

export const assignNgoToVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  const ngo = await Ngo.findById(req.body.ngoId);
  if (!volunteer || !ngo) throw new ApiError(404, "Volunteer or NGO not found");
  volunteer.ngo = ngo._id;
  volunteer.status = "available";
  volunteer.verificationStatus = "verified";
  await volunteer.save();
  await User.findByIdAndUpdate(volunteer.user, {
    profileRef: volunteer._id,
    profileModel: "Volunteer",
    profileSummary: {
      status: volunteer.status,
      verificationStatus: volunteer.verificationStatus,
      age: volunteer.age,
      gender: volunteer.gender,
      city: volunteer.city,
      state: volunteer.state,
      skills: volunteer.skills || [],
      availability: volunteer.availability,
      hasVehicle: volunteer.hasVehicle,
      vehicleType: volunteer.vehicleType,
      documentCount: volunteer.documents?.length || 0,
      documentUrls: (volunteer.documents || []).map((document) => document.url).filter(Boolean)
    }
  });
  res.json({ volunteer: toJSON(volunteer) });
});

export const verifyNgo = asyncHandler(async (req, res) => {
  const ngo = await Ngo.findById(req.params.id);
  if (!ngo) throw new ApiError(404, "NGO not found");

  const isApproved = req.body.status !== "rejected";
  ngo.isVerified = isApproved;
  ngo.kycStatus = isApproved ? "verified" : "rejected";
  await ngo.save();

  if (ngo.user) {
    await User.findByIdAndUpdate(ngo.user, {
      profileRef: ngo._id,
      profileModel: "Ngo",
      profileSummary: {
        organizationName: ngo.organizationName,
        registrationId: ngo.registrationId,
        kycStatus: ngo.kycStatus,
        isVerified: ngo.isVerified,
        city: ngo.city,
        state: ngo.state,
        documentCount: ngo.documents?.length || 0,
        documentUrls: (ngo.documents || []).map((document) => document.url).filter(Boolean)
      }
    });
  }

  res.json({ ngo: toJSON(ngo) });
});

export const createAllocation = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!req.body.ngoId || !amount || !req.body.purpose) {
    throw new ApiError(400, "NGO, amount, and purpose are required");
  }

  const allocation = await FundAllocation.create({
    donation: req.body.donationId || undefined,
    ngo: req.body.ngoId,
    amount,
    purpose: req.body.purpose,
    createdBy: req.user?._id
  });

  if (req.body.donationId) {
    await Donation.findByIdAndUpdate(req.body.donationId, { $inc: { allocatedAmount: amount } });
  }

  res.status(201).json({ allocation: toJSON(allocation) });
});

export const ngoOperations = asyncHandler(async (_req, res) => {
  const [requests, volunteers, resources, ngos] = await Promise.all([
    EmergencyRequest.find().sort({ createdAt: -1 }),
    Volunteer.find().populate("user").sort({ createdAt: -1 }),
    Resource.find().sort({ createdAt: -1 }),
    Ngo.find().sort({ createdAt: -1 })
  ]);
  const statusCounts = requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});
  const distribution = requests.reduce((acc, request) => {
    acc[request.type] = (acc[request.type] || 0) + 1;
    return acc;
  }, {});
  const resourcesAvailable = resources.reduce((sum, resource) => sum + Number(resource.available || 0), 0);

  res.json({
    stats: {
      activeRequests: requests.filter((request) => !["completed", "rejected"].includes(request.status)).length,
      criticalRequests: requests.filter((request) => request.urgency === "critical").length,
      volunteersAssigned: volunteers.filter((volunteer) => volunteer.status === "assigned").length,
      resourcesAvailable,
      averageResponseTime: "18 min"
    },
    charts: { statusCounts, distribution },
    requests: listJSON(requests),
    volunteers: volunteers.map((volunteer) => ({ ...toJSON(volunteer), user: toJSON(volunteer.user) })),
    resources: listJSON(resources),
    ngos: listJSON(ngos)
  });
});
