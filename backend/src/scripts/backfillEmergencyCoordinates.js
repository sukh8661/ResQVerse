import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import EmergencyRequest from "../models/EmergencyRequest.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

async function geocodeLocation(location) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey || !location) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&limit=1&apiKey=${apiKey}`,
      { signal: controller.signal }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const properties = data.features?.[0]?.properties;
    if (!Number.isFinite(Number(properties?.lat)) || !Number.isFinite(Number(properties?.lon))) return null;

    return {
      coordinates: { lat: Number(properties.lat), lng: Number(properties.lon) },
      location: properties.formatted || location
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  await connectDatabase();

  const requests = await EmergencyRequest.find({
    location: { $exists: true, $ne: "" },
    $or: [
      { coordinates: null },
      { coordinates: { $exists: false } },
      { "coordinates.lat": { $exists: false } },
      { "coordinates.lng": { $exists: false } }
    ]
  });

  console.log(`Emergency requests needing coordinates: ${requests.length}`);

  let updated = 0;
  for (const request of requests) {
    const geocoded = await geocodeLocation(request.location);
    if (!geocoded) continue;

    request.coordinates = geocoded.coordinates;
    request.location = geocoded.location;
    await request.save();
    updated += 1;
  }

  console.log(`Backfilled emergency request coordinates: ${updated} of ${requests.length}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
