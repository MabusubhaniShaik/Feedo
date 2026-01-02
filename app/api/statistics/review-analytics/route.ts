// app/api/statistics/review-analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductReview from "@/models/product_review.model";
import mongoose from "mongoose";
import { ResponseFormatter } from "@/helpers/response.formatter";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const product_owner_id = searchParams.get("product_owner_id");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    if (!product_owner_id) {
      return NextResponse.json(
        ResponseFormatter.error("product_owner_id is required", 400, {
          operation: "GET_ALL",
          collection: "Review Analytics",
        }),
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(product_owner_id)) {
      return NextResponse.json(
        ResponseFormatter.error("Invalid product_owner_id format", 400, {
          operation: "GET_ALL",
          collection: "Review Analytics",
        }),
        { status: 400 }
      );
    }

    const ownerId = new mongoose.Types.ObjectId(product_owner_id);

    const matchStage: any = {
      product_owner_id: ownerId,
      is_status: true,
    };

    // Add date filter if provided
    if (start_date || end_date) {
      matchStage.created_date = {};
      if (start_date) matchStage.created_date.$gte = new Date(start_date);
      if (end_date) matchStage.created_date.$lte = new Date(end_date);
    }

    // Get overview statistics
    const overview = await ProductReview.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total_reviews: { $sum: 1 },
          average_rating: { $avg: "$average_rating" },
          total_questions_answered: { $sum: { $size: "$review_info" } },
          total_comments: {
            $sum: {
              $size: {
                $filter: {
                  input: "$review_info",
                  as: "review",
                  cond: {
                    $ifNull: ["$$review.response_question_comment", false],
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // Get daily trend
    const dailyTrend = await ProductReview.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$created_date" },
            month: { $month: "$created_date" },
            day: { $dayOfMonth: "$created_date" },
          },
          count: { $sum: 1 },
          average_rating: { $avg: "$average_rating" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 30 },
    ]);

    // Get rating distribution
    const ratingDistribution = await ProductReview.aggregate([
      { $match: matchStage },
      {
        $bucket: {
          groupBy: "$average_rating",
          boundaries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const overviewData = overview[0] || {
      total_reviews: 0,
      average_rating: 0,
      total_questions_answered: 0,
      total_comments: 0,
    };

    const formattedData = {
      overview: {
        total_reviews: overviewData.total_reviews,
        average_rating: parseFloat(overviewData.average_rating.toFixed(1)),
        total_questions_answered: overviewData.total_questions_answered,
        total_comments: overviewData.total_comments,
      },
      daily_trend: dailyTrend.map((day) => ({
        date: `${day._id.year}-${day._id.month
          .toString()
          .padStart(2, "0")}-${day._id.day.toString().padStart(2, "0")}`,
        review_count: day.count,
        average_rating: parseFloat(day.average_rating.toFixed(1)),
      })),
      rating_distribution: ratingDistribution.map((rating) => ({
        rating_range: `${rating._id}-${rating._id + 1}`,
        count: rating.count,
        percentage:
          overviewData.total_reviews > 0
            ? parseFloat(
                ((rating.count / overviewData.total_reviews) * 100).toFixed(1)
              )
            : 0,
      })),
    };

    return NextResponse.json(
      ResponseFormatter.success(
        formattedData,
        "Review analytics fetched successfully",
        {
          operation: "GET_ALL",
          collection: "Review Analytics",
        }
      )
    );
  } catch (error: any) {
    console.error("Error fetching review analytics:", error);
    return NextResponse.json(
      ResponseFormatter.error(error, 500, {
        operation: "GET_ALL",
        collection: "Review Analytics",
      }),
      { status: 500 }
    );
  }
}
