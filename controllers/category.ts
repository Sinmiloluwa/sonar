import Category from "../models/category.js";
import { Request, Response } from "express";

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({}, "-__v").lean();
  res.json({ categories });
};
