import Reaction from "../models/reaction.js";
import { ReactionType } from "../models/reaction.js";
import Voice from "../models/voice.js";
import { notifyReaction } from "../services/notificationService.js";
import { Request, Response } from "express";

export const toggleReaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { type } = req.body as { type: ReactionType };
    const userId = req.user!.id;

    const post = await Voice.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const existing = await Reaction.findOne({ userId, voicePostId: postId });

    if (!existing) {
      await Reaction.create({ userId, voicePostId: postId, type });
      await Voice.findByIdAndUpdate(postId, { $inc: { [`reactions.${type}`]: 1 } });
      if (String(post.userId) !== userId) {
        notifyReaction(post.userId, userId, postId as string, type);
      }
      res.status(201).json({ reacted: true, type });
      return;
    }

    if (existing.type === type) {
      await existing.deleteOne();
      await Voice.findByIdAndUpdate(postId, { $inc: { [`reactions.${type}`]: -1 } });
      res.status(200).json({ reacted: false, type: null });
      return;
    }

    const oldType = existing.type;
    existing.type = type;
    await existing.save();
    await Voice.findByIdAndUpdate(postId, {
      $inc: { [`reactions.${oldType}`]: -1, [`reactions.${type}`]: 1 }
    });
    res.status(200).json({ reacted: true, type });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
