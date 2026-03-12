import User from '../models/user.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-fcmTokens -__v');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEmail = async (req, res) => {
    try {
    
        const userId = req.user.id;
        const { email } = req.body;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.authProvider === 'google') {
            return res.status(403).json({ message: "Cannot update email for Google accounts" });
        }

        if (currentUser.email && currentUser.email === email) {
            return res.status(400).json({ message: "New email is the same as the current email" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.findOneAndUpdate(
            { _id: userId, email: { $ne: email } }, 
            { email },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Email updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateLocation = async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.latitude = latitude;
      user.longitude = longitude;
      await user.save();

      res.json({ message: 'Location updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } 
  }

export const getNearbyUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { latitude, longitude } = user;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'User location not set' });
    }

    const R = 6371; 
    const maxDistance = 10;

    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id },
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};