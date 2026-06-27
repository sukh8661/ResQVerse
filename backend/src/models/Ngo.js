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

const warehouseSchema = new mongoose.Schema({
  name: String,
  location: String,
  capacity: Number
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  type: { type: String },
  count: Number,
  available: Number
}, { _id: false });

const ngoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  organizationName: { type: String, required: true, trim: true },
  registrationId: { type: String, trim: true, unique: true, sparse: true },
  contactPerson: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  description: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  documents: [documentSchema],
  warehouses: [warehouseSchema],
  vehicles: [vehicleSchema]
}, { timestamps: true });

export default mongoose.model("Ngo", ngoSchema);
