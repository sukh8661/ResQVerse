import crypto from "node:crypto";
import Razorpay from "razorpay";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";
import { broadcast } from "../utils/realtime.js";

function razorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return null;
  return new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
}

export const paymentConfig = asyncHandler(async (_req, res) => {
  res.json({ keyId: env.razorpayKeyId, paymentMode: env.razorpayKeyId ? "razorpay" : "offline" });
});

export const createOrder = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) throw new ApiError(400, "Valid amount is required");

  const client = razorpayClient();
  if (client) {
    const order = await client.orders.create({
      amount: Math.round(amount * 100),
      currency: req.body.currency || "INR",
      receipt: `resq_${Date.now()}`
    });
    return res.json({ success: true, ...order, keyId: env.razorpayKeyId });
  }

  res.json({
    success: true,
    id: `offline_order_${Date.now()}`,
    amount: Math.round(amount * 100),
    currency: req.body.currency || "INR",
    paymentMode: "offline"
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, donorData, donationType, amount } = req.body;
  const client = razorpayClient();

  if (client) {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", env.razorpayKeySecret).update(body).digest("hex");
    if (expected !== signature) throw new ApiError(400, "Payment signature verification failed");
  }

  const donation = await Donation.create({
    amount,
    currency: "INR",
    donationType,
    donorData: {
      name: donorData?.name,
      phone: donorData?.phone,
      email: donorData?.email
    },
    isAnonymous: Boolean(donorData?.anonymous),
    status: "successful",
    orderId,
    paymentId: paymentId || `offline_payment_${Date.now()}`,
    signature
  });

  await Campaign.updateOne({ status: "active" }, { $inc: { raisedAmount: Number(amount) } });
  broadcast("new_donation", { donation: toJSON(donation) });
  res.status(201).json({ success: true, donation: toJSON(donation) });
});

export const createOfflineDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.create({
    amount: Number(req.body.amount),
    currency: "INR",
    donationType: req.body.donationType,
    donorData: req.body.donorData,
    isAnonymous: Boolean(req.body.isAnonymous),
    status: "successful",
    orderId: req.body.orderId || `offline_order_${Date.now()}`,
    paymentId: `offline_payment_${Date.now()}`
  });
  await Campaign.updateOne({ status: "active" }, { $inc: { raisedAmount: Number(req.body.amount) } });
  broadcast("new_donation", { donation: toJSON(donation) });
  res.status(201).json({ success: true, donation: toJSON(donation) });
});

export const listDonations = asyncHandler(async (_req, res) => {
  const donations = await Donation.find({ status: "successful" }).sort({ createdAt: -1 });
  const totalAmount = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  res.json({ donations: listJSON(donations), totalAmount });
});

export const recentDonations = asyncHandler(async (_req, res) => {
  const donations = await Donation.find({ status: "successful" }).sort({ createdAt: -1 }).limit(10);
  res.json({ donations: listJSON(donations) });
});
