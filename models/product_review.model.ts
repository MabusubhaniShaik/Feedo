// models/product_review.model.ts - FIXED
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
  user_name?: string;
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
      // REMOVE: index: true,
    },
    product_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      // REMOVE: index: true,
    },
    user_name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    mobile_number: {
      type: String,
      required: true,
      trim: true,
      // REMOVE: index: true,
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
      required: true,
      min: 1,
      max: 10,
    },
    is_status: {
      type: Boolean,
      default: true,
      // REMOVE: index: true,
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

// KEEP THESE indexes but remove index: true from field definitions
ProductReviewSchema.index({ product_id: 1, created_date: -1 });
ProductReviewSchema.index({ product_code: 1, is_status: 1 });
ProductReviewSchema.index({ mobile_number: 1, product_id: 1 });
ProductReviewSchema.index({ mobile_number: 1, product_code: 1 });
ProductReviewSchema.index({ average_rating: 1 });
ProductReviewSchema.index({ created_date: -1 });
ProductReviewSchema.index({ is_status: 1 });

const ProductReview: Model<IProductReview> =
  mongoose.models.ProductReview ||
  mongoose.model<IProductReview>("ProductReview", ProductReviewSchema);

export default ProductReview;
