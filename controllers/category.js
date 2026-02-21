import Category from "../models/category.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({}, "-__v").lean();
  res.json({ categories });
};
