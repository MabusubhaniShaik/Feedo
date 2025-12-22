// config/preInstallation/preInst.ts
import fs from "fs";
import path from "path";
import mongoose from "mongoose"; // Import mongoose directly
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables FIRST
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DIR = path.join(process.cwd(), "config", "preInstallation", "seed");
const MODEL_DIR = path.join(process.cwd(), "models");

const getModelFileName = (seedFile: string) =>
  seedFile.replace(".seed.json", ".ts");

export const preInit = async (): Promise<void> => {
  // Connect to MongoDB directly - don't use connectDB() from lib/db.ts
  const MONGODB_URI =
    "mongodb+srv://feedo:feedo_123@feedo.tgsvg93.mongodb.net/feedo";
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not defined in environment");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  console.log("Pre-installation seeding started");

  const seedFiles = fs
    .readdirSync(SEED_DIR)
    .filter((file) => file.endsWith(".seed.json"));

  for (const seedFile of seedFiles) {
    const modelFile = getModelFileName(seedFile);
    const modelPath = path.join(MODEL_DIR, modelFile);

    if (!fs.existsSync(modelPath)) {
      console.log(`Model file not found: ${modelPath}`);
      continue;
    }

    const seedData = JSON.parse(
      fs.readFileSync(path.join(SEED_DIR, seedFile), "utf-8")
    );

    if (!Array.isArray(seedData)) {
      console.log(`Invalid seed data format in ${seedFile}`);
      continue;
    }

    try {
      // Import model using dynamic import
      const modelUrl = `file://${modelPath}`;
      const modelModule = await import(modelUrl);
      const Model = modelModule.default;

      if (!Model) {
        console.log(`No default export in ${modelFile}`);
        continue;
      }

      console.log(`Processing ${seedFile}...`);

      for (const item of seedData) {
        const exists = await Model.findOne({ id: item.id }).lean();
        if (!exists) {
          await Model.create(item);
          console.log(
            `  Created: ${modelFile.replace(".ts", "")} ID ${item.id}`
          );
        } else {
          console.log(
            `  Skipped: ${modelFile.replace(".ts", "")} ID ${
              item.id
            } (already exists)`
          );
        }
      }
    } catch (error) {
      console.error(`Error processing ${seedFile}:`, error);
    }
  }

  console.log("Pre-installation seeding completed");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  preInit().catch(console.error);
}
