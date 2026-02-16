import mongoose from "mongoose";

const REACTION_TYPES = ["fire", "heart", "clap"];

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voicePostId: { type: mongoose.Schema.Types.ObjectId, ref: "VoicePost", required: true },
  type: { type: String, enum: REACTION_TYPES, required: true },
  createdAt: { type: Date, default: Date.now }
});

reactionSchema.index({ userId: 1, voicePostId: 1 }, { unique: true });
reactionSchema.index({ voicePostId: 1 });

export { REACTION_TYPES };
export default mongoose.model("Reaction", reactionSchema);
