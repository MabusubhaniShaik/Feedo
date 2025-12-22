// controllers/RoleController.ts
import { RESTController } from "@/helpers/rest.controller";
import Role from "@/models/role";

export class RoleController extends RESTController<any> {
  constructor() {
    super(Role, "Role", ["name", "description"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`Role pre-save hook for ${operation}:`, data);
    // Add role-specific logic based on IRole schema
    if (operation === "CREATE") {
      // Set default values based on IRole schema
      data.created_date = new Date();
      data.updated_date = new Date();
      if (!data.created_by) {
        data.created_by = "system"; // Default value
      }
    } else if (operation === "UPDATE") {
      // Update timestamp on update
      data.updated_date = new Date();
    }
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`Role post-save hook for ${operation}:`, data);
    // Add role-specific post-save logic
  }
}
