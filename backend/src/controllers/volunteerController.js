import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import Ngo from "../models/Ngo.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import VolunteerStory from "../models/VolunteerStory.js";
import { ApiError } from "../utils/apiError.js";
import { hashPassword, randomPassword } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";
import { broadcast } from "../utils/realtime.js";

async function volunteersWithUsers(filter = {}) {
  const volunteers = await Volunteer.find(filter).populate("user").sort({ createdAt: -1 });
  return volunteers.map((volunteer) => ({
    ...toJSON(volunteer),
    user: toJSON(volunteer.user),
    ngoId: volunteer.ngo ? String(volunteer.ngo) : undefined
  }));
}

export const listVolunteers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.available === "true") {
    filter.status = "available";
    filter.verificationStatus = "verified";
  }
  res.json({ volunteers: await volunteersWithUsers(filter) });
});

export const createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.create({
    user: req.body.userId,
    skills: req.body.skills || [],
    location: req.body.location,
    vehicleType: req.body.vehicleType,
    coordinates: req.body.coordinates,
    status: "pending"
  });
  broadcast("new_volunteer", { volunteer: toJSON(volunteer) });
  res.status(201).json({ volunteer: toJSON(volunteer) });
});

export const registerVolunteer = asyncHandler(async (req, res) => {
  const { name, email, phone, selectedNgoId } = req.body;
  if (!name || !phone) throw new ApiError(400, "Name and phone are required");

  const existing = await User.findOne({
    $or: [{ phone }, ...(email ? [{ email: email.toLowerCase() }] : [])]
  });
  if (existing) throw new ApiError(409, "A user with this phone or email already exists");

  const generatedPassword = randomPassword();
  const username = (email || phone).toLowerCase();
  const user = await User.create({
    username,
    email,
    phone,
    fullName: name,
    role: "volunteer",
    address: req.body.address,
    passwordHash: await hashPassword(generatedPassword)
  });

  const preferredNgo = selectedNgoId ? await Ngo.findById(selectedNgoId) : null;
  const volunteer = await Volunteer.create({
    user: user._id,
    age: req.body.age,
    gender: req.body.gender,
    phone,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    location: [req.body.city, req.body.state].filter(Boolean).join(", ") || req.body.address,
    availability: req.body.availability,
    availabilityDates: req.body.availabilityDates,
    skills: req.body.skills || [],
    preferredRole: req.body.preferredRole,
    preferredNgo: preferredNgo?._id,
    consentGiven: Boolean(req.body.consentGiven),
    status: "pending",
    verificationStatus: "pending"
  });

  broadcast("new_volunteer", { volunteer: toJSON(volunteer) });
  res.status(201).json({
    volunteer: toJSON(volunteer),
    credentials: { username, password: generatedPassword }
  });
});

export const leaderboard = asyncHandler(async (_req, res) => {
  const volunteers = await Volunteer.find({ verificationStatus: "verified" }).populate("user").sort({ creditPoints: -1 }).limit(10);
  res.json(listJSON(volunteers).map((volunteer, index) => ({ ...volunteer, rank: index + 1 })));
});

export const listStories = asyncHandler(async (_req, res) => {
  const stories = await VolunteerStory.find({ isPublished: true }).populate({ path: "volunteer", populate: "user" }).sort({ createdAt: -1 }).limit(20);
  res.json(listJSON(stories));
});

export const createStory = asyncHandler(async (req, res) => {
  const story = await VolunteerStory.create({
    volunteer: req.body.volunteerId,
    title: req.body.title,
    story: req.body.story
  });
  res.status(201).json({ story: toJSON(story) });
});

export const volunteerTasks = asyncHandler(async (req, res) => {
  const requests = await EmergencyRequest.find({ assignedVolunteer: req.params.id }).sort({ createdAt: -1 });
  res.json({ requests: listJSON(requests) });
});
