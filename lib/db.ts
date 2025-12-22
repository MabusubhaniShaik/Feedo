import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI not defined");

declare global {
  var _mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        logged?: boolean;
      }
    | undefined;
}

let cached = global._mongoose || { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise)
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  cached.conn = await cached.promise;

  if (!cached.logged) {
    console.log("MongoDB connected");
    cached.logged = true;
  }

  return cached.conn;
}

// Auto-connect on import
connectDB().catch((err) => console.error("MongoDB connection error:", err));
