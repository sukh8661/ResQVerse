import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import Ngo from "../models/Ngo.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload?.userId) throw new ApiError(401, "Authentication required");

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) throw new ApiError(401, "Invalid session");

  req.user = user;
  if (user.role === "volunteer") req.profile = await Volunteer.findOne({ user: user._id });
  if (user.role === "ngo") req.profile = await Ngo.findOne({ user: user._id });
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };
}
