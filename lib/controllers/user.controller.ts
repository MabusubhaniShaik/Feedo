// @/lib/controllers/user.controller.ts
import { RESTController } from "@/helpers/rest.controller";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";

export class UserController extends RESTController<any> {
  constructor() {
    super(User, "User", ["name", "email", "role_id"]);
  }

  protected async preSave(data: any, operation: string): Promise<void> {
    console.log(`User pre-save hook for ${operation}:`, data);

    // Hash password if it's provided
    if (data.password) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, $2y$)
        const isAlreadyHashed = /^\$2[aby]\$\d+\$/.test(data.password);

        if (!isAlreadyHashed) {
          // Hash the password with bcrypt
          const saltRounds = 10;
          data.password = await bcrypt.hash(data.password, saltRounds);
          console.log("Password hashed successfully");
        }
      } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Failed to hash password");
      }
    }
  }

  protected async postSave(data: any, operation: string): Promise<void> {
    console.log(`User post-save hook for ${operation}:`, data);
  }
}
