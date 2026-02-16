import Reaction from "../models/reaction.js";
import Voice from "../models/voice.js";

export const toggleReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    const post = await Voice.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await Reaction.findOne({ userId, voicePostId: postId });

    if (!existing) {
      await Reaction.create({ userId, voicePostId: postId, type });
      await Voice.findByIdAndUpdate(postId, { $inc: { [`reactions.${type}`]: 1 } });
      return res.status(201).json({ reacted: true, type });
    }

    if (existing.type === type) {
      await existing.deleteOne();
      await Voice.findByIdAndUpdate(postId, { $inc: { [`reactions.${type}`]: -1 } });
      return res.status(200).json({ reacted: false, type: null });
    }

    const oldType = existing.type;
    existing.type = type;
    await existing.save();
    await Voice.findByIdAndUpdate(postId, {
      $inc: { [`reactions.${oldType}`]: -1, [`reactions.${type}`]: 1 }
    });
    return res.status(200).json({ reacted: true, type });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
