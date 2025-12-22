// src/models/auth.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserAuthToken extends Document {
  user_id: string; // Changed to String
  user_name: string; // Add this field
  access_token: string;
  refresh_token: string;
  expired_time: Date;
  login_time: Date;
  logout_time?: Date;
  created_by: string; // Changed to String
  updated_by: string; // Changed to String
  created_date: Date;
  updated_date: Date;
}

const UserAuthTokenSchema: Schema<IUserAuthToken> = new Schema(
  {
    user_id: {
      type: String, // Store MongoDB _id as string
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
      unique: true,
    },
    refresh_token: {
      type: String,
      required: true,
      unique: true,
    },
    expired_time: {
      type: Date,
      required: true,
    },
    login_time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    logout_time: {
      type: Date,
      default: null,
    },
    created_by: {
      type: String,
      default: "SYSTEM",
    },
    updated_by: {
      type: String,
      default: "SYSTEM",
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    updated_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: "user_auth_token",
  }
);

// Check if model already exists
let UserAuthToken: Model<IUserAuthToken>;

try {
  UserAuthToken = mongoose.model<IUserAuthToken>("user_auth_token");
} catch {
  UserAuthToken = mongoose.model<IUserAuthToken>(
    "user_auth_token",
    UserAuthTokenSchema
  );
}

export default UserAuthToken;
