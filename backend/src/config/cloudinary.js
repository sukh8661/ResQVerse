import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret
});

export function isCloudinaryConfigured() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

export function uploadBufferToCloudinary(file, folder = "resqverse/documents", metadata = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: metadata.publicId || `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-")}`,
        tags: metadata.tags || ["resqverse"],
        context: metadata.context || {}
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}
