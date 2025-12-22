// src/models/User.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  role_name: string;
  image_url?: string;
  isEmailVerified: boolean;
  is_default_password: boolean;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_date: Date;
  updated_date: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role_id: {
      type: String,
      required: true,
    },
    role_name: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    is_default_password: {
      type: Boolean,
      default: true,
    },
    is_active: {
      type: Boolean,
      default: true,
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
    collection: "user",
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ user_id: 1 });
UserSchema.index({ role_id: 1 });
UserSchema.index({ is_active: 1 });

// Auto-update updated_date on modifications
UserSchema.pre("findOneAndUpdate", function () {
  this.set({ updated_date: new Date() });
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
