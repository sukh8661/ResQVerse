import mongoose from "mongoose";

const fundRequestSchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo", required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amountRequested: { type: Number, required: true, min: 1 },
  amountApproved: { type: Number, default: 0, min: 0 },
  purpose: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  details: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pending", "approved", "partially_approved", "rejected"],
    default: "pending"
  },
  adminNote: { type: String, trim: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: "FundAllocation" }
}, { timestamps: true });

export default mongoose.model("FundRequest", fundRequestSchema);
