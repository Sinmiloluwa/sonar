import User from "../models/user.js";
import Voice from "../models/voice.js";
import Category from "../models/category.js";
import { Request, Response } from "express";

export const search = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, type, tag, category, userId, page = 1 } = req.query as {
            q?: string;
            type?: string;
            tag?: string;
            category?: string;
            userId?: string;
            page?: number | string;
        };

        const limit = 20;
        const skip = (Number(page) - 1) * limit;
        const results: Record<string, unknown> = {};

        const shouldSearch = (t: string) => !type || type === "all" || type === t;

        if (q && shouldSearch("users")) {
            results.users = await User.find({
                username: { $regex: q, $options: 'i' }
            })
            .select('username displayName profilePicture')
            .limit(limit)
            .sort({ username: 1 });
        }

        if (shouldSearch("posts")) {
            const query: Record<string, unknown> = {};

            if (q) {
                const matchingCategories = await Category.find({
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                    ]
                }).select('_id');

                const categoryIds = matchingCategories.map(c => c._id);

                query.$or = [
                    { description: { $regex: q, $options: 'i' } },
                    { tags: { $regex: q, $options: 'i' } },
                    ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
                ];
            }

            if (tag) {
                query.tags = tag.toLowerCase();
            }

            if (category) {
                query.category = category;
            }

            if (userId) {
                query.userId = userId;
            }

            const voices = await Voice.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "username displayName profilePicture")
                .populate("category", "name imageUrl");

            const total = await Voice.countDocuments(query);

            results.posts = {
                voices,
                pagination: {
                    page: parseInt(String(page)),
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }

        if (shouldSearch("tags")) {
            results.tags = await Voice.aggregate([
                { $unwind: "$tags" },
                { $group: { _id: "$tags", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 50 },
                { $project: { tag: "$_id", count: 1, _id: 0 } }
            ]);
        }

        res.status(200).json(results);
    } catch (error) {
        console.log("Search error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
