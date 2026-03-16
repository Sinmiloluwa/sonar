import User from '../models/user.js';
import { Request, Response } from "express";

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('-fcmTokens -__v').lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select('-fcmTokens -__v');
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { email } = req.body as { email: string };

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (currentUser.authProvider === 'google') {
      res.status(403).json({ message: "Cannot update email for Google accounts" });
      return;
    }

    if (currentUser.email && currentUser.email === email) {
      res.status(400).json({ message: "New email is the same as the current email" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, email: { $ne: email } },
      { email },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "Email updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body as { latitude: number; longitude: number };
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ message: 'Latitude and longitude must be numbers' });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.latitude = latitude;
    user.longitude = longitude;
    await user.save();

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getNearbyUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { latitude, longitude } = user;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ message: 'User location not set' });
      return;
    }

    const R = 6371;
    const maxDistance = 10;

    const nearbyUsers = await User.find({
      _id: { $ne: req.user!.id },
      latitude: { $exists: true },
      longitude: { $exists: true },
      $expr: {
        $lte: [
          {
            $multiply: [
              2 * R,
              {
                $asin: {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          { $sin: { $divide: [{ $subtract: [{ $degreesToRadians: '$latitude' }, { $degreesToRadians: latitude }] }, 2] } },
                          2
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: latitude } },
                          { $cos: { $degreesToRadians: '$latitude' } },
                          {
                            $pow: [
                              { $sin: { $divide: [{ $subtract: [{ $degreesToRadians: '$longitude' }, { $degreesToRadians: longitude }] }, 2] } },
                              2
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          },
          maxDistance
        ]
      }
    }).select('username displayName profilePicture bio');

    res.json({ nearbyUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
