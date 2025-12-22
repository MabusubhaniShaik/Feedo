// @/lib/controllers/user.controller.ts
import { RESTController } from "@/helpers/rest.controller";
import User from "@/models/user.model";

export class UserController extends RESTController<any> {
  constructor() {
    super(User, "User", ["name", "email", "role_id"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`User pre-save hook for ${operation}:`, data);
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`User post-save hook for ${operation}:`, data);
  }
}

export default UserController;
