import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username?: string;
  password?: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  fcmTokens: string[];
  latitude?: number;
  longitude?: number;
  bio?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, sparse: true },
  password: { type: String, select: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  profilePicture: { type: String },
  fcmTokens: [{ type: String }],
  latitude: { type: Number },
  longitude: { type: Number },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", userSchema);
