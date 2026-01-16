import User from "../models/user.js";
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';

export const anonymousAuth = async (req, res) => {
  try {
    
    const { username } = req.body
    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({ username });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Welcome on board", user: user, token: token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};