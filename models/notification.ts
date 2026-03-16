import mongoose, { Document, Schema, Types } from "mongoose";

export const NOTIFICATION_TYPES = ["reaction", "new_follower", "upload_complete", "new_post", "login"] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  actorId: Types.ObjectId | null;
  type: NotificationType;
  read: boolean;
  voicePostId: Types.ObjectId | null;
  reactionType: 'fire' | 'heart' | 'clap' | null;
  actorUsername: string | null;
  actorDisplayName: string | null;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  read: { type: Boolean, default: false },
  voicePostId: { type: Schema.Types.ObjectId, ref: "VoicePost", default: null },
  reactionType: { type: String, enum: ["fire", "heart", "clap"], default: null },
  // Denormalized to avoid joins on list fetch
  actorUsername: { type: String, default: null },
  actorDisplayName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
