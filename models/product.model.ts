// models/product.model.ts - UPDATED with 5 question limit
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductQuestion {
  _id: Types.ObjectId;
  question_text: string;
  max_rating: number;
  info?: string;
  is_active?: boolean;
  created_date?: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string[];
  images_urls: string[];
  product_code: string;
  price?: number;
  product_owner_id: Types.ObjectId;
  product_owner_name: string;
  questions: IProductQuestion[];
  total_reviews: number;
  average_rating: number;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_date: Date;
  updated_date: Date;
}

// Question sub-schema
const QuestionSchema = new Schema<IProductQuestion>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    question_text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    max_rating: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 10,
    },
    info: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

// Main Product Schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: [String],
      required: true,
    },
    product_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    images_urls: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    product_owner_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product_owner_name: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
      validate: {
        validator: function (questions: IProductQuestion[]) {
          return questions.length <= 5; // Maximum 5 questions
        },
        message: "A product can have maximum 5 questions",
      },
    },
    total_reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
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
    collection: "product",
    timestamps: false,
  }
);

// Indexes for optimized queries
ProductSchema.index({ product_code: 1 }, { unique: true });
ProductSchema.index({ product_owner_id: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ is_active: 1 });
ProductSchema.index({ average_rating: -1 });
ProductSchema.index({ total_reviews: -1 });
ProductSchema.index({ created_date: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
