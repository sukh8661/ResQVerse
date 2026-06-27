import multer from "multer";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

export const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error("Only PDF, JPG, PNG, and WEBP documents are allowed"));
    }
    callback(null, true);
  }
});

const allowedEmergencyAudioTypes = new Set([
  "audio/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "application/octet-stream"
]);

export const uploadEmergencyAudio = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedEmergencyAudioTypes.has(file.mimetype)) {
      return callback(new Error("Only audio files are allowed for emergency voice requests"));
    }
    callback(null, true);
  }
});
