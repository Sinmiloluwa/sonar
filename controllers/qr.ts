import QRCode from 'qrcode';
import User from '../models/user.js';
import Voice from '../models/voice.js';
import { Request, Response } from "express";

const BASE_URL = process.env.APP_URL;

export const myProfileQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.user!;
    const link = `${BASE_URL}/profile/${username}`;
    const qr = await QRCode.toDataURL(link);
    res.json({ qr, link });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const userProfileQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('username');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const link = `${BASE_URL}/profile/${user.username}`;
    const qr = await QRCode.toDataURL(link);
    res.json({ qr, link });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const postQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Voice.findById(req.params.postId).select('_id');
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const link = `${BASE_URL}/post/${post._id}`;
    const qr = await QRCode.toDataURL(link);
    res.json({ qr, link });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
