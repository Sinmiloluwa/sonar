import QRCode from 'qrcode';
import User from '../models/user.js';
import Voice from '../models/voice.js';

const SCHEME = 'sonar';

export const myProfileQR = async (req, res) => {
  try {
    const { username } = req.user;
    const deepLink = `${SCHEME}://profile/${username}`;
    const qr = await QRCode.toDataURL(deepLink);
    res.json({ qr, deepLink });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const userProfileQR = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deepLink = `${SCHEME}://profile/${user.username}`;
    const qr = await QRCode.toDataURL(deepLink);
    res.json({ qr, deepLink });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const postQR = async (req, res) => {
  try {
    const post = await Voice.findById(req.params.postId).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const deepLink = `${SCHEME}://post/${post._id}`;
    const qr = await QRCode.toDataURL(deepLink);
    res.json({ qr, deepLink });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
