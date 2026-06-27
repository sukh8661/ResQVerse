import Campaign from "../models/Campaign.js";
import Communication from "../models/Communication.js";
import Disaster from "../models/Disaster.js";
import Donation from "../models/Donation.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Resource from "../models/Resource.js";
import Volunteer from "../models/Volunteer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";

export const stats = asyncHandler(async (_req, res) => {
  const [activeCases, volunteers, donations, completedRequests] = await Promise.all([
    EmergencyRequest.countDocuments({ status: { $nin: ["completed", "rejected"] } }),
    Volunteer.countDocuments({ verificationStatus: "verified" }),
    Donation.find({ status: "successful" }),
    EmergencyRequest.find({ status: "completed" })
  ]);
  const donationsRaised = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const livesHelped = completedRequests.reduce((sum, request) => sum + Number(request.peopleCount || 1), 0);
  res.json({ stats: { activeCases, volunteers, donationsRaised, livesHelped } });
});

export const campaigns = asyncHandler(async (_req, res) => {
  const campaigns = await Campaign.find({ status: "active" }).sort({ createdAt: -1 });
  res.json({ campaigns: listJSON(campaigns) });
});

export const activeDisasters = asyncHandler(async (_req, res) => {
  const disasters = await Disaster.find({ status: "active" }).sort({ createdAt: -1 });
  res.json({ disasters: listJSON(disasters) });
});

export const listCommunication = asyncHandler(async (_req, res) => {
  const messages = await Communication.find().sort({ createdAt: -1 }).limit(50);
  res.json({ messages: listJSON(messages) });
});

export const createCommunication = asyncHandler(async (req, res) => {
  const message = await Communication.create({
    senderName: req.user?.fullName || req.body.senderName || "Operations",
    message: req.body.message,
    channel: req.body.channel || "operations",
    createdBy: req.user?._id
  });
  res.status(201).json({ message: toJSON(message) });
});
