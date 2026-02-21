import mongoose from "mongoose";

const VoicePostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  audioUrl: String,
  duration: Number,
  tags: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, maxlength: 500 },
  reactions: {
    fire: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    clap: { type: Number, default: 0 },
  },
  plays: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

VoicePostSchema.index({ userId: 1, createdAt: -1 });
VoicePostSchema.index({ tags: 1 });
VoicePostSchema.index({ category: 1 });
VoicePostSchema.index({ createdAt: -1 });
VoicePostSchema.index({ tags: "text" });

export default mongoose.model("VoicePost", VoicePostSchema);
