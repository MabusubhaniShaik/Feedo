// controllers/RoleController.ts
import { RESTController } from "@/helpers/rest.controller";
import ProductReview from "@/models/product_review.model";

export class ProductReviewController extends RESTController<any> {
  constructor() {
    super(ProductReview, "Product Review", ["name", "description"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`ProductReview pre-save hook for ${operation}:`, data);
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`ProductReview post-save hook for ${operation}:`, data);
  }
}
