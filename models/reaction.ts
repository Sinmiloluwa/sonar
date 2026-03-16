import mongoose, { Document, Schema, Types } from "mongoose";

export const REACTION_TYPES = ["fire", "heart", "clap"] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export interface IReaction extends Document {
  userId: Types.ObjectId;
  voicePostId: Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

const reactionSchema = new Schema<IReaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  voicePostId: { type: Schema.Types.ObjectId, ref: "VoicePost", required: true },
  type: { type: String, enum: REACTION_TYPES, required: true },
  createdAt: { type: Date, default: Date.now }
});

reactionSchema.index({ userId: 1, voicePostId: 1 }, { unique: true });
reactionSchema.index({ voicePostId: 1 });

export default mongoose.model<IReaction>("Reaction", reactionSchema);
