import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

export default mongoose.model("User", userSchema);
