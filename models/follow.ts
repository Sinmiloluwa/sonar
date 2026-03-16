import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

export default mongoose.model<IFollow>("Follow", followSchema);
