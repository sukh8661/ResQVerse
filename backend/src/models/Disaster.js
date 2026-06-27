import mongoose from "mongoose";

const disasterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  description: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model("Disaster", disasterSchema);
