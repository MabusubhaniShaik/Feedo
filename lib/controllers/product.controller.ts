// controllers/RoleController.ts
import { RESTController } from "@/helpers/rest.controller";
import Product from "@/models/product.model";

export class ProductController extends RESTController<any> {
  constructor() {
    super(Product, "Product", ["name", "description"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`Product pre-save hook for ${operation}:`, data);
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`Product post-save hook for ${operation}:`, data);
  }
}
