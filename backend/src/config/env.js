import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  tokenSecret: process.env.AUTH_TOKEN_SECRET || "resqverse-dev-secret",
  seedDatabase: String(process.env.SEED_DATABASE || "false").toLowerCase() === "true",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ""
};

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is required. Add it to backend/.env");
}
