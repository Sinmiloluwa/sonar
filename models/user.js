import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true },
  authProvider: { type: String, enum: ['anonymous', 'google'], default: 'anonymous' },
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  profilePicture: { type: String },
  fcmTokens: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
