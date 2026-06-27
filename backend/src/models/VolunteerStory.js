import mongoose from "mongoose";

const volunteerStorySchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
  title: { type: String, required: true, trim: true },
  story: { type: String, required: true, trim: true },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("VolunteerStory", volunteerStorySchema);
