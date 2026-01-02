// app/api/statistics/owner-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import ProductReview from "@/models/product_review.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const product_owner_id = searchParams.get("product_owner_id");

    if (!product_owner_id) {
      return NextResponse.json(
        {
          status: "ERROR",
          status_code: 400,
          message: "product_owner_id is required",
        },
        { status: 400 }
      );
    }

    // Convert to ObjectId
    const ownerId = new mongoose.Types.ObjectId(product_owner_id);

    // Get total products count
    const totalProducts = await Product.countDocuments({
      product_owner_id: ownerId,
      is_active: true,
    });

    // Get total reviews count
    const totalReviews = await ProductReview.countDocuments({
      product_owner_id: ownerId,
      is_status: true,
    });

    // Get average rating
    const avgRatingResult = await ProductReview.aggregate([
      { $match: { product_owner_id: ownerId, is_status: true } },
      { $group: { _id: null, averageRating: { $avg: "$average_rating" } } },
    ]);

    // Get products with reviews
    const productsWithReviews = await ProductReview.aggregate([
      { $match: { product_owner_id: ownerId, is_status: true } },
      { $group: { _id: "$product_id" } },
      { $count: "count" },
    ]);

    // Get recent reviews
    const recentReviews = await ProductReview.find({
      product_owner_id: ownerId,
      is_status: true,
    })
      .sort({ created_date: -1 })
      .limit(5)
      .select("product_code average_rating created_date email")
      .lean();

    // Get top rated products
    const topProducts = await ProductReview.aggregate([
      { $match: { product_owner_id: ownerId, is_status: true } },
      {
        $group: {
          _id: "$product_id",
          product_code: { $first: "$product_code" },
          review_count: { $sum: 1 },
          average_rating: { $avg: "$average_rating" },
        },
      },
      { $sort: { average_rating: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      status: "SUCCESS",
      status_code: 200,
      message: "Owner statistics fetched successfully",
      data: {
        summary: {
          total_products: totalProducts,
          total_reviews: totalReviews,
          average_rating: avgRatingResult[0]?.averageRating
            ? parseFloat(avgRatingResult[0].averageRating.toFixed(1))
            : 0,
          products_with_reviews: productsWithReviews[0]?.count || 0,
        },
        recent_reviews: recentReviews.map((review) => ({
          product_code: review.product_code,
          rating: review.average_rating,
          email: review.email,
          date: review.created_date,
        })),
        top_products: topProducts.map((product) => ({
          product_id: product._id,
          product_code: product.product_code,
          review_count: product.review_count,
          average_rating: parseFloat(product.average_rating.toFixed(1)),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching owner statistics:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        status_code: 500,
        message: error.message || "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
