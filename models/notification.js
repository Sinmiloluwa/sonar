import mongoose from "mongoose";

const NOTIFICATION_TYPES = ["reaction", "new_follower", "upload_complete", "new_post", "login"];

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  read: { type: Boolean, default: false },
  voicePostId: { type: mongoose.Schema.Types.ObjectId, ref: "VoicePost", default: null },
  reactionType: { type: String, enum: ["fire", "heart", "clap"], default: null },
  // Denormalized to avoid joins on list fetch
  actorUsername: { type: String, default: null },
  actorDisplayName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1 });

export { NOTIFICATION_TYPES };
export default mongoose.model("Notification", notificationSchema);
