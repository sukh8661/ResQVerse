import mongoose from "mongoose";

const fundAllocationSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo", required: true },
  amount: { type: Number, required: true, min: 1 },
  purpose: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("FundAllocation", fundAllocationSchema);
