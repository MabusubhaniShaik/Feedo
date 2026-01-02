// app/api/statistics/product-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import ProductReview from "@/models/product_review.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get("product_id");

    if (!product_id) {
      return NextResponse.json(
        {
          status: "ERROR",
          status_code: 400,
          message: "product_id is required",
        },
        { status: 400 }
      );
    }

    const productObjectId = new mongoose.Types.ObjectId(product_id);

    // Get product details
    const product = await Product.findById(productObjectId)
      .select("name product_code total_reviews average_rating questions")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          status: "ERROR",
          status_code: 404,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Get review statistics
    const reviewStats = await ProductReview.aggregate([
      { $match: { product_id: productObjectId, is_status: true } },
      {
        $group: {
          _id: null,
          total_reviews: { $sum: 1 },
          average_rating: { $avg: "$average_rating" },
          min_rating: { $min: "$average_rating" },
          max_rating: { $max: "$average_rating" },
          total_questions_answered: { $sum: { $size: "$review_info" } },
        },
      },
    ]);

    // Get question-wise statistics
    const questionStats = await ProductReview.aggregate([
      { $match: { product_id: productObjectId, is_status: true } },
      { $unwind: "$review_info" },
      {
        $group: {
          _id: "$review_info.response_question_id",
          question_text: { $first: "$review_info.response_question_text" },
          average_rating: { $avg: "$review_info.response_rating" },
          total_responses: { $sum: 1 },
          total_comments: {
            $sum: {
              $cond: [
                { $ifNull: ["$review_info.response_question_comment", false] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { average_rating: -1 } },
    ]);

    // Get monthly trend
    const monthlyTrend = await ProductReview.aggregate([
      { $match: { product_id: productObjectId, is_status: true } },
      {
        $group: {
          _id: {
            year: { $year: "$created_date" },
            month: { $month: "$created_date" },
          },
          count: { $sum: 1 },
          average_rating: { $avg: "$average_rating" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);

    const stats = reviewStats[0] || {
      total_reviews: 0,
      average_rating: 0,
      min_rating: 0,
      max_rating: 0,
      total_questions_answered: 0,
    };

    return NextResponse.json({
      status: "SUCCESS",
      status_code: 200,
      message: "Product statistics fetched successfully",
      data: {
        product: {
          name: product.name,
          product_code: product.product_code,
          total_reviews: product.total_reviews,
          average_rating: product.average_rating,
          total_questions: product.questions.length,
        },
        review_statistics: {
          total_reviews: stats.total_reviews,
          average_rating: parseFloat(stats.average_rating.toFixed(1)),
          min_rating: stats.min_rating,
          max_rating: stats.max_rating,
          total_questions_answered: stats.total_questions_answered,
        },
        question_statistics: questionStats.map((q) => ({
          question_id: q._id,
          question_text: q.question_text,
          average_rating: parseFloat(q.average_rating.toFixed(1)),
          total_responses: q.total_responses,
          total_comments: q.total_comments,
        })),
        monthly_trend: monthlyTrend.map((m) => ({
          month: `${m._id.year}-${m._id.month.toString().padStart(2, "0")}`,
          review_count: m.count,
          average_rating: parseFloat(m.average_rating.toFixed(1)),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching product statistics:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        status_code: 500,
        message: error.message || "Failed to fetch product statistics",
      },
      { status: 500 }
    );
  }
}
