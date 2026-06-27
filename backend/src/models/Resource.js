import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 },
  distributed: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: true, trim: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: "Ngo" }
}, { timestamps: true });

export default mongoose.model("Resource", resourceSchema);
