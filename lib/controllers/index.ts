// lib/controllers/index.ts
import { RESTController } from "@/helpers/rest.controller";

// Import all controllers here
import { RoleController } from "./role.controller";
import { UserController } from "./user.controller";
import { ProductController } from "./product.controller";
import { ProductReviewController } from "./product-review.controller";
// Export all controllers as a record
export const controllers: Record<string, RESTController<any>> = {
  role: new RoleController(),
  user: new UserController(),
  product: new ProductController(),
  "product-review": new ProductReviewController(),
};

// Helper to get available endpoints
export const getAvailableEndpoints = () => {
  return Object.keys(controllers).map((c) => `/api/${c}`);
};
