import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  status: String,
  note: String,
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const emergencyRequestSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  type: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ["low", "medium", "critical"], default: "medium" },
  description: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  peopleCount: { type: Number, default: 1 },
  coordinates: {
    lat: Number,
    lng: Number
  },
  requesterName: { type: String, trim: true },
  requesterPhone: { type: String, trim: true },
  userId: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "assigned", "started", "reached", "in_progress", "completed", "rejected"],
    default: "pending"
  },
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
  assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" },
  audioNote: {
    type: { type: String },
    size: Number,
    recordedAt: Date,
    url: String,
    publicId: String,
    cloudinaryAssetId: String,
    resourceType: String,
    format: String
  },
  progress: [progressSchema]
}, { timestamps: true });

emergencyRequestSchema.index({ status: 1, urgency: 1, createdAt: -1 });

export default mongoose.model("EmergencyRequest", emergencyRequestSchema);
