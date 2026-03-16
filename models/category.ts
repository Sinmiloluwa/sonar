import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: "" },
});

export default mongoose.model<ICategory>("Category", CategorySchema);
