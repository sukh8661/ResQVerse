import EmergencyRequest from "../models/EmergencyRequest.js";
import Volunteer from "../models/Volunteer.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";
import { broadcast } from "../utils/realtime.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

async function geocodeLocation(location) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey || !location) return null;

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&limit=1&apiKey=${apiKey}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const properties = data.features?.[0]?.properties;
    if (!Number.isFinite(Number(properties?.lat)) || !Number.isFinite(Number(properties?.lon))) return null;

    return {
      coordinates: { lat: Number(properties.lat), lng: Number(properties.lon) },
      location: properties.formatted || location
    };
  } catch {
    return null;
  }
}

export const listRequests = asyncHandler(async (_req, res) => {
  const requests = await EmergencyRequest.find({ status: { $ne: "rejected" } }).sort({ createdAt: -1 });
  res.json({ requests: listJSON(requests) });
});

export const createRequest = asyncHandler(async (req, res) => {
  if (!req.body.type || !req.body.location) throw new ApiError(400, "Emergency type and location are required");

  let coordinates = typeof req.body.coordinates === "string"
    ? JSON.parse(req.body.coordinates || "null")
    : req.body.coordinates;
  let location = req.body.location;

  if (!coordinates?.lat || !coordinates?.lng) {
    const geocoded = await geocodeLocation(req.body.location);
    if (geocoded) {
      coordinates = geocoded.coordinates;
      location = geocoded.location;
    }
  }
  let audioNote = req.body.audioNote;
  if (typeof audioNote === "string") {
    try {
      audioNote = JSON.parse(audioNote);
    } catch {
      audioNote = null;
    }
  }

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file, "resqverse/emergency-audio", {
      tags: ["resqverse", "emergency-request", "voice"],
      context: {
        app: "ResQVerse",
        requestType: req.body.type,
        location
      }
    });
    audioNote = {
      type: req.file.mimetype,
      size: req.file.size,
      recordedAt: new Date(),
      url: result.secure_url,
      publicId: result.public_id,
      cloudinaryAssetId: result.asset_id,
      resourceType: result.resource_type,
      format: result.format
    };
  }

  const request = await EmergencyRequest.create({
    title: req.body.title || `${req.body.type} Emergency`,
    type: req.body.type,
    urgency: req.body.urgency || "medium",
    description: req.body.description,
    location,
    peopleCount: Number(req.body.peopleCount || 1),
    coordinates,
    requesterName: req.body.requesterName,
    requesterPhone: req.body.requesterPhone,
    userId: req.body.userId || "public",
    audioNote
  });
  broadcast("new_emergency_request", { request: toJSON(request) });
  res.status(201).json({ request: toJSON(request) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Emergency request not found");
  request.status = req.body.status;
  request.progress.push({ status: req.body.status, note: `Status changed to ${req.body.status}`, createdBy: req.user?._id });
  await request.save();
  broadcast("request_status_update", { request: toJSON(request) });
  res.json({ request: toJSON(request) });
});

export const assignVolunteer = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  const volunteer = await Volunteer.findById(req.body.volunteerId);
  if (!request || !volunteer) throw new ApiError(404, "Request or volunteer not found");
  request.assignedVolunteer = volunteer._id;
  request.assignedNgo = volunteer.ngo;
  request.status = "assigned";
  request.progress.push({ status: "assigned", note: "Volunteer assigned", volunteer: volunteer._id, createdBy: req.user?._id });
  volunteer.status = "assigned";
  await request.save();
  await volunteer.save();
  broadcast("request_status_update", { request: toJSON(request) });
  res.json({ request: toJSON(request) });
});

export const addProgress = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Emergency request not found");
  request.status = req.body.status || request.status;
  request.progress.push({
    status: req.body.status,
    note: req.body.note,
    volunteer: req.profile?._id,
    createdBy: req.user?._id
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
