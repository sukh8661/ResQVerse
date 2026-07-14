import User from "../models/User.js";
import Ngo from "../models/Ngo.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken, hashPassword } from "../utils/auth.js";
import { toJSON } from "../utils/mapper.js";

export const registerNgo = asyncHandler(async (req, res) => {
  const { name, organizationName, registrationId, email, phone, address, password, documents } = req.body;
  if (!(name || organizationName) || !registrationId || !email || !password) {
    throw new ApiError(400, "NGO name, registration ID, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({
    username: email.toLowerCase(),
    email,
    phone,
    fullName: name || organizationName,
    role: "ngo",
    address,
    passwordHash: await hashPassword(password)
  });

  const ngo = await Ngo.create({
    user: user._id,
    organizationName: name || organizationName,
    registrationId,
    email,
    phone,
    address,
    location: address,
    description: "Registered NGO partner",
    documents: documents || [],
    isVerified: false,
    kycStatus: "pending"
  });

  user.profileRef = ngo._id;
  user.profileModel = "Ngo";
  user.profileSummary = {
    organizationName: ngo.organizationName,
    registrationId: ngo.registrationId,
    kycStatus: ngo.kycStatus,
    isVerified: ngo.isVerified
  };
  await user.save();

  res.status(201).json({
    token: createToken({ userId: String(user._id), role: user.role }),
    user: toJSON(user),
    profile: toJSON(ngo)
  });
});
