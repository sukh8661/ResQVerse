import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "completed", "paused"], default: "active" }
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
