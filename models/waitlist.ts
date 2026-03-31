import mongoose, { Document, Schema, Types }from "mongoose";

const WaitlistSchema = new Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export interface IWaitlistEntry extends Document {
  email: string;
  createdAt: Date;
}

WaitlistSchema.index({ email: 1 });
WaitlistSchema.index({ createdAt: -1 });

export default mongoose.model<IWaitlistEntry>("WaitlistEntry", WaitlistSchema);