// controllers/product-reviewController.ts
import { RESTController } from "@/helpers/rest.controller";
import ProductReview, { IReviewInfo } from "@/models/product_review.model";
import Product from "@/models/product.model";

export class ProductReviewController extends RESTController<any> {
  constructor() {
    super(ProductReview, "Product Review", [
      "product_code",
      "product_owner_name",
      "mobile_number",
      "email",
    ]);
  }

  protected async preSave(data: any): Promise<any> {
    console.log(":::::data", data);
    // Calculate average rating from review_info
    if (data.review_info && Array.isArray(data.review_info)) {
      const averageRating = this.calculateAverageRating(data.review_info);
      data.average_rating = averageRating;
    }

    // Get product owner info from product collection
    if (data.product_id) {
      try {
        const product = await Product.findById(data.product_id)
          .select("product_owner_id product_owner_name") // These should match your Product model fields
          .lean();

        if (product) {
          console.log("::: product data", product);
          // Map the fields correctly
          data.product_owner_id =
            product.product_owner_id || data.user_id || data.mobile_number;
          data.product_owner_name =
            product.product_owner_name || data.user_name || "Anonymous";
        } else {
          // Fallback if product not found
          data.product_owner_id = data.user_id || data.mobile_number;
          data.product_owner_name = data.user_name || "Anonymous";
        }
        console.log(":::: After data", data);
      } catch (error) {
        console.error("Error fetching product owner info:", error);
        // Fallback values
        data.product_owner_id = data.user_id || data.mobile_number;
        data.product_owner_name = data.user_name || "Anonymous";
      }
    }

    // Set timestamps
    const now = new Date();
    if (!data.created_date) data.created_date = now;
    data.updated_date = now;

    // Set defaults
    if (!data.created_by) data.created_by = "SYSTEM";
    if (!data.updated_by) data.updated_by = "SYSTEM";

    return data;
  }

  protected async validateData(data: any): Promise<void> {
    // Validate review_info
    if (
      !data.review_info ||
      !Array.isArray(data.review_info) ||
      data.review_info.length === 0
    ) {
      throw new Error("At least one review info is required");
    }

    // Validate each review info
    for (const reviewInfo of data.review_info) {
      if (!reviewInfo.response_question_id) {
        throw new Error("response_question_id is required");
      }
      if (!reviewInfo.response_question_text) {
        throw new Error("response_question_text is required");
      }
      if (
        !reviewInfo.response_rating ||
        reviewInfo.response_rating < 1 ||
        reviewInfo.response_rating > 10
      ) {
        throw new Error("response_rating must be between 1 and 10");
      }
    }

    // Validate required fields
    if (!data.product_id) throw new Error("product_id is required");
    if (!data.mobile_number) throw new Error("mobile_number is required");
  }

  // Helper method to calculate average rating
  private calculateAverageRating(reviewInfo: IReviewInfo[]): number {
    if (!reviewInfo || reviewInfo.length === 0) return 1;

    const totalRating = reviewInfo.reduce(
      (sum, review) => sum + review.response_rating,
      0
    );
    return parseFloat((totalRating / reviewInfo.length).toFixed(1));
  }

  // Get reviews by product ID with product owner info
  async getByProductId(productId: string, filters: any = {}) {
    const query: any = { product_id: productId };

    if (filters.is_status !== undefined) {
      query.is_status = filters.is_status;
    }

    const page = filters.page || 0;
    const limit = filters.limit || 10;

    const [reviews, total] = await Promise.all([
      ProductReview.find(query)
        .sort({ created_date: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      ProductReview.countDocuments(query),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update existing reviews with product_owner_id and product_owner_name
  async updateReviewsWithOwnerInfo() {
    try {
      // Find all reviews without product_owner_id
      const reviews = await ProductReview.find({
        $or: [
          { product_owner_id: { $exists: false } },
          { product_owner_name: { $exists: false } },
        ],
      }).lean();

      let updatedCount = 0;

      for (const review of reviews) {
        if (review.product_id) {
          const product = await Product.findById(review.product_id)
            .select("product_owner_id product_owner_name")
            .lean();

          if (product) {
            await ProductReview.updateOne(
              { _id: review._id },
              {
                $set: {
                  product_owner_id: product.product_owner_id,
                  product_owner_name: product.product_owner_name,
                },
              }
            );
            updatedCount++;
          }
        }
      }

      return {
        message: `Updated ${updatedCount} reviews with product owner info`,
        total: reviews.length,
        updated: updatedCount,
      };
    } catch (error) {
      console.error("Error updating reviews:", error);
      throw new Error("Failed to update reviews with owner info");
    }
  }

  // Get product statistics with owner info
  async getProductStats(productId: string) {
    const reviews = await ProductReview.find({
      product_id: productId,
      is_status: true,
    }).lean();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        totalQuestionsAnswered: 0,
      };
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.average_rating,
      0
    );
    const totalQuestionsAnswered = reviews.reduce(
      (sum, review) => sum + review.review_info.length,
      0
    );

    // Get product owner info from first review or product collection
    let productOwnerInfo = {};
    if (reviews[0].product_owner_id && reviews[0].product_owner_name) {
      productOwnerInfo = {
        product_owner_id: reviews[0].product_owner_id,
        product_owner_name: reviews[0].product_owner_name,
      };
    } else {
      // Fetch from product collection if missing in review
      const product = await Product.findById(productId)
        .select("product_owner_id product_owner_name")
        .lean();

      if (product) {
        productOwnerInfo = {
          product_owner_id: product.product_owner_id,
          product_owner_name: product.product_owner_name,
        };
      }
    }

    return {
      totalReviews: reviews.length,
      averageRating: parseFloat((totalRating / reviews.length).toFixed(1)),
      totalQuestionsAnswered,
      ...productOwnerInfo,
    };
  }
}
