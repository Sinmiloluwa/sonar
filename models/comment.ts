import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  voicePostId: Types.ObjectId;
  userId: Types.ObjectId;
  audioUrl: string;
  duration: number;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  voicePostId: { type: Schema.Types.ObjectId, ref: "VoicePost", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  audioUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

commentSchema.index({ voicePostId: 1, createdAt: -1 });

export default mongoose.model<IComment>("Comment", commentSchema);
