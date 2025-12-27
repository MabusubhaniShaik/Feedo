// scripts/seed-users.ts
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { hashSync } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DEFAULT_PASSWORD = "Password@123";
const HASHED_PASSWORD = hashSync(DEFAULT_PASSWORD, 10);

// Helper to generate user ID
const generateUserId = (roleName: string, count: number): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = roleName.toUpperCase().slice(0, 3);
  const sequence = count.toString().padStart(3, "0");
  return `${prefix}${year}-${sequence}`;
};

// Generate user object
const generateUser = (role_id: number, role_name: string, count: number) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();

  return {
    user_id: generateUserId(role_name, count),
    name: `${firstName} ${lastName}`,
    email,
    password: HASHED_PASSWORD,
    role_id: role_id.toString(),
    role_name,
    isEmailVerified: true,
    is_default_password: true,
    is_active: true,
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  };
};

// MongoDB connection
const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb+srv://feedo:feedo_123@feedo.tgsvg93.mongodb.net/feedo";

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

// Main runner
const main = async () => {
  try {
    await connectDB();

    console.log("Starting user seeding...");

    const db: any = mongoose.connection.db;
    const userCollection = db.collection("user");

    // Clear users
    await userCollection.deleteMany({});
    console.log("🧹 Cleared existing users");

    const users = [
      // 1 Owner
      generateUser(0, "Owner", 1),

      // 1 Admin
      generateUser(1, "Admin", 1),

      // 18 Users
      ...Array.from({ length: 18 }, (_, i) => generateUser(2, "User", i + 1)),
    ];

    await userCollection.insertMany(users);

    console.log("Seeded users successfully");
    console.log("Owner: 1 | Admin: 1 | Users: 18");

    const total = await userCollection.countDocuments();
    console.log(`Total users: ${total}`);

    // Preview
    const preview = await userCollection.find().limit(5).toArray();
    console.log("👀 Sample users:");
    preview.forEach((u: any) =>
      console.log(`- ${u.user_id} | ${u.role_name} | ${u.email}`)
    );
  } catch (error) {
    console.error("User seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

main();
