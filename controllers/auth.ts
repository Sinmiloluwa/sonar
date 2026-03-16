import User from "../models/user.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { notifyLogin } from "../services/notificationService.js";
import { Request, Response } from "express";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user: { _id: unknown; username?: string }) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: '24h' });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body as { username: string; email: string; password: string };

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      res.status(409).json({ message: `${field} already in use` });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      authProvider: 'local',
    });

    notifyLogin(user._id).catch(err => console.error("notifyLogin failed:", err));

    const token = signToken(user);
    res.status(201).json({ message: "Account created", user: { _id: user._id, username: user.username, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body as { identifier: string; password: string };

    const isEmail = identifier.includes('@');
    const user = await User.findOne(
      isEmail ? { email: identifier } : { username: identifier }
    ).select('+password');
    if (!user || user.authProvider !== 'local' || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    notifyLogin(user._id).catch(err => console.error("notifyLogin failed:", err));

    const token = signToken(user);
    res.status(200).json({ message: "Login successful", user: { _id: user._id, username: user.username, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body as { idToken: string };

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;
    const { sub: googleId, email, name: displayName, picture: profilePicture } = payload;

    let user = await User.findOne({ googleId }) || await User.findOne({ email });

    if (!user) {
      const username = email!.split('@')[0];
      user = await User.create({ username, authProvider: 'google', googleId, email, displayName, profilePicture });
    }

    notifyLogin(user._id).catch(err => console.error("notifyLogin failed:", err));

    const token = signToken(user);
    res.status(200).json({ message: "Login successful", user: { _id: user._id, username: user.username, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};
