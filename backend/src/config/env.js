import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: backendEnvPath });
dotenv.config();

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");
const defaultClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://resqverse.vercel.app",
  "https://resqverse-2ql0.onrender.com"
];
const clientOrigins = [
  ...defaultClientOrigins,
  ...(process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean)
].filter((origin, index, origins) => origins.indexOf(origin) === index);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: clientOrigins[0] || defaultClientOrigins[0],
  clientOrigins,
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
