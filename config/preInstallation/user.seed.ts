// scripts/seed-users.ts
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { hashSync } from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const DEFAULT_PASSWORD = "Password@123";
const HASHED_PASSWORD = hashSync(DEFAULT_PASSWORD, 10);

// Helper to generate user ID based on role
const generateUserId = (roleName: string, count: number): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = roleName.toUpperCase().slice(0, 3);
  const sequence = count.toString().padStart(3, "0");
  return `${prefix}${year}-${sequence}`;
};

// Generate user data
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
    isEmailVerified: faker.datatype.boolean(),
    is_default_password: true,
    is_active: true,
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
    created_date: new Date(),
    updated_date: new Date(),
  };
};

// Connect to database
const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb+srv://feedo:feedo_123@feedo.tgsvg93.mongodb.net/feedo";

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

// Main execution
const main = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("Starting user seeding...");

    // Get the "user" collection directly
    const db: any = mongoose.connection.db;
    const userCollection = db.collection("user"); // Singular "user"

    // Clear existing users first
    await userCollection.deleteMany({});
    console.log("Cleared existing users");

    // Generate admin users
    const adminUsers = Array.from({ length: 3 }, (_, index) =>
      generateUser(1, "Admin", index + 1)
    );

    // Generate regular users
    const regularUsers = Array.from({ length: 5 }, (_, index) =>
      generateUser(2, "User", index + 1)
    );

    // Insert all users
    await userCollection.insertMany([...adminUsers, ...regularUsers]);

    console.log(`Seeded ${adminUsers.length} Admin users`);
    console.log(`Seeded ${regularUsers.length} User users`);
    console.log("User seeding completed");

    // Verify
    const totalUsers = await userCollection.countDocuments();
    console.log(`Total users in 'user' collection: ${totalUsers}`);

    // Show a few sample users
    const sampleUsers = await userCollection.find().limit(3).toArray();
    console.log("Sample users:");
    sampleUsers.forEach((user: any) => {
      console.log(`- ${user.user_id}: ${user.name} (${user.email})`);
    });
  } catch (error) {
    console.error("User seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
main();
