import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "INR" },
  donationType: { type: String, trim: true },
  donorData: {
    name: String,
    phone: String,
    email: String
  },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ["created", "successful", "failed"], default: "created" },
  paymentProvider: { type: String, default: "razorpay" },
  orderId: { type: String, trim: true },
  paymentId: { type: String, trim: true },
  signature: { type: String, trim: true },
  allocatedAmount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

donationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Donation", donationSchema);
