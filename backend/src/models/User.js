import mongoose from "mongoose";

const optionalString = {
  type: String,
  trim: true,
  lowercase: true,
  set: (value) => value === "" || value === null ? undefined : value
};

const optionalPhone = {
  type: String,
  trim: true,
  set: (value) => value === "" || value === null ? undefined : value
};

const userSchema = new mongoose.Schema({
  username: { ...optionalString, unique: true, sparse: true },
  email: { ...optionalString, unique: true, sparse: true },
  phone: { ...optionalPhone, unique: true, sparse: true },
  fullName: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "ngo", "volunteer", "donor", "user"], default: "user" },
  address: { type: String, trim: true },
  profileRef: { type: mongoose.Schema.Types.ObjectId, refPath: "profileModel" },
  profileModel: { type: String, enum: ["Volunteer", "Ngo"] },
  profileSummary: {
    status: String,
    verificationStatus: String,
    organizationName: String,
    registrationId: String,
    age: Number,
    gender: String,
    city: String,
    state: String,
    skills: [String],
    availability: String,
    hasVehicle: Boolean,
    vehicleType: String,
    documentCount: { type: Number, default: 0 },
    documentUrls: [String]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
