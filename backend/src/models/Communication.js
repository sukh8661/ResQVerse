import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema({
  channel: { type: String, default: "operations" },
  senderName: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Communication", communicationSchema);
