import Comment from "../models/comment.js";
import Voice from "../models/voice.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { Request, Response } from "express";

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!req.file) {
      res.status(400).json({ message: "No audio file" });
      return;
    }

    const post = await Voice.findById(postId).lean();
    if (!post) {
      res.status(404).json({ message: "Voice post not found" });
      return;
    }

    const { duration } = req.body as { duration: number };
    const { buffer } = req.file;
    const userId = req.user!.id;

    res.status(202).json({ message: "Comment upload started" });

    uploadToCloudinary(buffer).then(async (result) => {
      await Comment.create({
        voicePostId: postId,
        userId,
        audioUrl: result.secure_url,
        duration,
      });
    }).catch((err: Error) => {
      console.error("Comment upload failed:", err.message);
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query as { page?: string; limit?: string };
    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ voicePostId: postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "username displayName profilePicture")
        .lean(),
      Comment.countDocuments({ voicePostId: postId }),
    ]);

    res.status(200).json({
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      userId: req.user!.id,
    });

    if (!comment) {
      res.status(404).json({ message: "Comment not found or not yours" });
      return;
    }

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
