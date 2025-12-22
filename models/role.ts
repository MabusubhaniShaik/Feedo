import { Schema, model, Document, models } from "mongoose";

export interface IRole extends Document {
  id: number;
  name: string;
  description?: string;
  created_date: Date;
  updated_date: Date;
  created_by: string;
  updated_by?: string;
}

const RoleSchema = new Schema<IRole>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    updated_date: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: String,
      required: true,
    },
    updated_by: {
      type: String,
      default: "",
    },
  },
  {
    collection: "role",
    strict: true,
    timestamps: false,
    versionKey: false,
  }
);

// Add this check to prevent overwrite in Next.js hot reload
const Role = models.Role || model<IRole>("Role", RoleSchema);
export default Role;
