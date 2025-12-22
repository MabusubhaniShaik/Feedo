// controllers/RoleController.ts
import { RESTController } from "@/helpers/rest.controller";
import Role from "@/models/role.model";

export class RoleController extends RESTController<any> {
  constructor() {
    super(Role, "Role", ["name", "description"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`Role pre-save hook for ${operation}:`, data);
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`Role post-save hook for ${operation}:`, data);
  }
}
