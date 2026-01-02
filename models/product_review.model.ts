// models/product_review.model.ts - UPDATED (without pre-save)
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReviewInfo {
  response_question_id: Types.ObjectId;
  response_question_text: string;
  response_question_comment?: string;
  response_rating: number;
  image_urls?: string[];
}

export interface IProductReview extends Document {
  product_id: Types.ObjectId;
  product_code: string;
  product_owner_id?: Types.ObjectId;
  product_owner_name: string;
  mobile_number: string;
  email?: string;
  review_info: IReviewInfo[];
  average_rating: number;
  is_status: boolean;
  created_by: string;
  updated_by: string;
  created_date: Date;
  updated_date: Date;
}

// Review info sub-schema
const ReviewInfoSchema = new Schema<IReviewInfo>(
  {
    response_question_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    response_question_text: {
      type: String,
      required: true,
      trim: true,
    },
    response_question_comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    response_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    image_urls: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

// Main Product Review Schema
const ProductReviewSchema: Schema<IProductReview> = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    product_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    product_owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    product_owner_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    mobile_number: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    review_info: {
      type: [ReviewInfoSchema],
      required: true,
      validate: {
        validator: (reviewInfo: IReviewInfo[]) => reviewInfo.length > 0,
        message: "At least one review info is required",
      },
    },
    average_rating: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    is_status: {
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
    collection: "product_review",
    timestamps: false,
  }
);

const ProductReview: Model<IProductReview> =
  mongoose.models.ProductReview ||
  mongoose.model<IProductReview>("ProductReview", ProductReviewSchema);

export default ProductReview;
