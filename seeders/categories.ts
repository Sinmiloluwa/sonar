import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/category.js";

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

const categories: CategorySeed[] = [
  {
    name: "rant",
    slug: "rant",
    description: "Unfiltered thoughts, frustrations, and hot takes.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAva6xs7KF2wXX0OmaGyd9W_Da95z7_OKQlrDYvtaf__zSWsDXVopWVVJWpU1t7aK8Zc_rPmTuoqNnllaND5jWaMOi-d4sIEfiAYjs0wfEHrkvfuIXhXTQe5b2tOKo6auuY8mfepym7SCqziL1ew6l5dGvILTQ4HROQXUeNYSYHy07UGN9564yvLl1Df87vLDNACZm6VShZHKqWv6RE9Il78bXPMeAx8RB6p2Itny6bd2QvTdCzEmnZ4fPtjmq5Kt8QFauPgOQy3s8",
  },
  {
    name: "bant",
    slug: "bant",
    description: "Playful banter, jokes, and witty exchanges.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWIS75ztdu_tpjG9jhToxhyhAZm07dHi1CvS8mq-yiQoNvE4Corcs_k5_Pl9pmeD20i5zB7c0UVOJQQA1LlC_iHbTHxOer58DcFM6l09JL565puWRL2SDvcDCWwl4_su5XH1C6dUqkiHXZxR0qrhYu8TeqeLCo1UFLh-gJiolkvv9uEQLjr1bInHN1nM48Nt9-6GU7UfvzxTkDW8AgG3hFxidVBOX-x_xpIBW3QTnh9WOiWq7p07gyLOuoswnYp8_cqDtPsPvwGd0",
  },
  {
    name: "music",
    slug: "music",
    description: "Music clips, covers, freestyles, and original tracks.",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "comedy",
    slug: "comedy",
    description: "Stand-up, skits, and funny moments.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1705883063417-5ee5a23d16fd?q=80&w=2093&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "story",
    slug: "story",
    description: "Personal stories, experiences, and narratives.",
    imageUrl: "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "question",
    slug: "question",
    description: "Questions, polls, and thought-provoking topics.",
    imageUrl: "https://images.unsplash.com/photo-1557318041-1ce374d55ebf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "opinion",
    slug: "opinion",
    description: "Personal opinions, debates, and perspectives.",
    imageUrl: "https://images.unsplash.com/photo-1739268365457-14913998bc21?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "other",
    slug: "other",
    description: "Everything else that doesn't fit a category.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1664195074794-35beb8cd632f?q=80&w=2023&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export async function seedCategories(): Promise<void> {
  await Category.bulkWrite(
    categories.map(({ slug, name, description, imageUrl }) => ({
      updateOne: {
        filter: { slug },
        update: {
          $set: { name, slug, description, imageUrl },
        },
        upsert: true,
      },
    }))
  );
  console.log(`Categories seeded (${categories.length} upserted).`);
}

// Allow running directly: node seeders/categories.js
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.env.NODE_ENV !== "production") dotenv.config();
  const mongoUri = process.env.MONGO_URI?.replace(/^["']|["']$/g, "");
  connectDB(mongoUri)
    .then(() => seedCategories())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error("Seeder failed:", err);
      process.exit(1);
    });
}
