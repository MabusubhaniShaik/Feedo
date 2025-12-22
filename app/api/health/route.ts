import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const conn = await connectDB();

    // Native MongoDB db instance
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { connected: false, error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    // Safe DB details (NO secrets)
    const dbDetails = {
      name: db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: collectionNames,
    };

    return NextResponse.json({
      connected: true,
      db: dbDetails,
    });
  } catch (error) {
    console.error("DB status error:", error);
    return NextResponse.json(
      {
        connected: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
