import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  label: String,
  ownerModel: String,
  userId: String,
  profileId: String,
  cloudinaryAssetId: String,
  name: String,
  originalName: String,
  type: { type: String },
  size: Number,
  bytes: Number,
  format: String,
  resourceType: String,
  url: String,
  publicId: String,
  uploadedAt: Date
}, { _id: false });

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String, trim: true }],
  preferredRole: { type: String, trim: true },
  availability: { type: String, trim: true },
  availabilityDates: { type: String, trim: true },
  age: Number,
  gender: { type: String, trim: true },
  location: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  vehicleType: { type: String, trim: true },
  hasVehicle: { type: Boolean, default: false },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" },
  preferredNgo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" },
  documents: [documentSchema],
  status: { type: String, enum: ["available", "assigned", "offline", "pending"], default: "pending" },
  verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  creditPoints: { type: Number, default: 0 },
  totalResponses: { type: Number, default: 0 },
  consentGiven: { type: Boolean, default: false }
}, { timestamps: true });

volunteerSchema.index({ status: 1, verificationStatus: 1 });

export default mongoose.model("Volunteer", volunteerSchema);
