import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import Ngo from "../models/Ngo.js";
import { ApiError } from "../utils/apiError.js";
import { createToken, hashPassword, verifyPassword } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toJSON } from "../utils/mapper.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

async function sessionForUser(user) {
  let profile = null;
  if (user.role === "volunteer") profile = await Volunteer.findOne({ user: user._id });
  if (user.role === "ngo") profile = await Ngo.findOne({ user: user._id });
  return {
    token: createToken({ userId: String(user._id), role: user.role }),
    user: toJSON(user),
    profile: toJSON(profile)
  };
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, phone, fullName, password, role = "user", address } = req.body;
  if (!fullName || !password || (!email && !username && !phone)) {
    throw new ApiError(400, "Full name, password, and one login identifier are required");
  }

  const identifierQuery = [];
  if (email) identifierQuery.push({ email: email.toLowerCase() });
  if (username) identifierQuery.push({ username: username.toLowerCase() });
  if (phone) identifierQuery.push({ phone });
  const existing = identifierQuery.length ? await User.findOne({ $or: identifierQuery }) : null;
  if (existing) throw new ApiError(409, "A user with these credentials already exists");

  const user = await User.create({
    username,
    email,
    phone,
    fullName,
    role,
    address,
    passwordHash: await hashPassword(password)
  });

  res.status(201).json(await sessionForUser(user));
});

export const login = asyncHandler(async (req, res) => {
  const identifier = (req.body.identifier || req.body.email || req.body.username || "").toLowerCase().trim();
  const { password } = req.body;
  if (!identifier || !password) throw new ApiError(400, "Identifier and password are required");

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }, { phone: identifier }]
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.json(await sessionForUser(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: toJSON(req.user), profile: toJSON(req.profile) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["fullName", "phone", "address"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: toJSON(req.user) });
});

function parseProfileBody(req) {
  const parsed = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (key === "skills") {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value ? String(value).split(",").map((item) => item.trim()).filter(Boolean) : [];
      }
    } else {
      parsed[key] = value;
    }
  }
  return parsed;
}

async function uploadProfileDocuments(files, role, user, profile) {
  const documents = [];
  for (const [index, file] of (files || []).entries()) {
    const profileId = String(profile._id);
    const userId = String(user._id);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    const result = await uploadBufferToCloudinary(file, `resqverse/${role}-documents`, {
      publicId: `${profileId}-${Date.now()}-${index}-${cleanName}`,
      tags: ["resqverse", role, profileId, userId],
      context: {
        app: "ResQVerse",
        role,
        userId,
        profileId,
        ownerModel: role === "ngo" ? "Ngo" : "Volunteer",
        originalName: file.originalname
      }
    });
    documents.push({
      label: role === "ngo" ? "Registration document" : "Government ID",
      ownerModel: role === "ngo" ? "Ngo" : "Volunteer",
      userId,
      profileId,
      cloudinaryAssetId: result.asset_id,
      name: file.originalname,
      originalName: file.originalname,
      type: file.mimetype,
      size: file.size,
      bytes: result.bytes,
      format: result.format,
      resourceType: result.resource_type,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    });
  }
  return documents;
}

export const signupProfile = asyncHandler(async (req, res) => {
  const body = parseProfileBody(req);
  const role = body.role;

  if (!["ngo", "volunteer"].includes(role)) {
    throw new ApiError(400, "Please select NGO or volunteer account type");
  }
  if (!body.fullName || !body.email || !body.phone || !body.password) {
    throw new ApiError(400, "Full name, email, phone, and password are required");
  }
  if (role === "ngo" && (!body.organizationName || !body.registrationId)) {
    throw new ApiError(400, "NGO name and registration ID are required");
  }

  const existing = await User.findOne({
    $or: [{ email: body.email.toLowerCase() }, { phone: body.phone }]
  });
  if (existing) throw new ApiError(409, "An account with this email or phone already exists");

  let user;
  let profile;

  try {
    user = await User.create({
    username: body.email.toLowerCase(),
    email: body.email,
    phone: body.phone,
    fullName: body.fullName,
    role,
    address: body.address,
    passwordHash: await hashPassword(body.password)
    });

    if (role === "ngo") {
      profile = await Ngo.create({
        user: user._id,
        organizationName: body.organizationName,
        registrationId: body.registrationId,
        contactPerson: body.contactPerson || body.fullName,
        email: body.email,
        phone: body.phone,
        location: [body.city, body.state].filter(Boolean).join(", ") || body.address,
        address: body.address,
        city: body.city,
        state: body.state,
        description: body.description,
        isVerified: false,
        kycStatus: "pending"
      });
    } else {
      profile = await Volunteer.create({
        user: user._id,
        age: body.age ? Number(body.age) : undefined,
        gender: body.gender,
        skills: Array.isArray(body.skills) ? body.skills : [],
        preferredRole: body.preferredRole,
        availability: body.availability,
        address: body.address,
        city: body.city,
        state: body.state,
        location: [body.city, body.state].filter(Boolean).join(", ") || body.address,
        vehicleType: body.hasVehicle === "yes" ? body.vehicleType || "available" : "none",
        hasVehicle: body.hasVehicle === "yes",
        consentGiven: true,
        status: "pending",
        verificationStatus: "pending"
      });
    }

    if (req.files?.length) {
      profile.documents = await uploadProfileDocuments(req.files, role, user, profile);
      await profile.save();
    }

    user.profileRef = profile._id;
    user.profileModel = role === "ngo" ? "Ngo" : "Volunteer";
    user.profileSummary = role === "ngo" ? {
      status: profile.kycStatus,
      verificationStatus: profile.kycStatus,
      organizationName: profile.organizationName,
      registrationId: profile.registrationId,
      city: profile.city,
      state: profile.state,
      documentCount: profile.documents?.length || 0,
      documentUrls: (profile.documents || []).map((document) => document.url).filter(Boolean)
    } : {
      status: profile.status,
      verificationStatus: profile.verificationStatus,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      state: profile.state,
      skills: profile.skills || [],
      availability: profile.availability,
      hasVehicle: profile.hasVehicle,
      vehicleType: profile.vehicleType,
      documentCount: profile.documents?.length || 0,
      documentUrls: (profile.documents || []).map((document) => document.url).filter(Boolean)
    };
    await user.save();
  } catch (error) {
    if (profile?._id) {
      if (role === "ngo") await Ngo.deleteOne({ _id: profile._id });
      if (role === "volunteer") await Volunteer.deleteOne({ _id: profile._id });
    }
    if (user?._id) await User.deleteOne({ _id: user._id });
    throw error;
  }

  res.status(201).json({
    token: createToken({ userId: String(user._id), role: user.role }),
    user: toJSON(user),
    profile: toJSON(profile)
  });
});
