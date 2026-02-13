import User from "../models/user.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const anonymousAuth = async (req, res) => {
  try {

    const { username } = req.body
    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({ username, authProvider: 'anonymous' });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Successful", user: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const displayName = payload.name;
    const profilePicture = payload.picture;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      const username = email.split('@')[0];
      user = await User.create({
        username,
        authProvider: 'google',
        googleId,
        email,
        displayName,
        profilePicture,
      });
    }

    const jwtPayload = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Successful", user: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};