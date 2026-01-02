// middleware/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Interface matching YOUR token structure
export interface DecodedToken {
  user: {
    _id: string;
    user_id: string;
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    isEmailVerified: boolean;
    is_default_password: boolean;
    is_active: boolean;
    created_by: string;
    updated_by: string;
    created_date: string;
    updated_date: string;
  };
  user_id: string;
  email: string;
  role: string;
  role_id: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  status: number;
}

export class AuthMiddleware {
  // Optional: Load public collections from environment variable
  private static getPublicCollections(): Set<string> {
    const publicCollections = process.env.PUBLIC_COLLECTIONS?.split(",") || [];
    return new Set(publicCollections);
  }

  static isPublicCollection(collection: string): boolean {
    return this.getPublicCollections().has(collection);
  }

  static async validateToken(token: string): Promise<{
    isValid: boolean;
    decoded?: DecodedToken;
    error?: string;
  }> {
    try {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

      if (!cleanToken) {
        return { isValid: false, error: "No token provided" };
      }

      const JWT_SECRET = process.env.JWT_SECRET;

      if (!JWT_SECRET) {
        return { isValid: false, error: "Server configuration error" };
      }

      const decoded = jwt.verify(cleanToken, JWT_SECRET) as DecodedToken;
      return {
        isValid: true,
        decoded,
      };
    } catch (error: any) {
      let errorMessage = "Invalid token";

      if (error.name === "TokenExpiredError") {
        errorMessage = "Token expired";
      } else if (error.name === "JsonWebTokenError") {
        errorMessage = "Invalid token format";
      }

      return { isValid: false, error: errorMessage };
    }
  }

  static extractUserFromToken(decoded: DecodedToken): {
    id: string;
    email: string;
    name: string;
    role: string;
  } {
    const user = decoded.user;
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role_name,
    };
  }

  static async authenticateRequest(
    req: NextRequest,
    collection: string,
    method: string
  ): Promise<AuthResult> {
    // Check if collection is public
    if (this.isPublicCollection(collection)) {
      return { success: true, status: 200 };
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return {
        success: false,
        error: "No authorization token provided",
        status: 401,
      };
    }

    const tokenValidation = await this.validateToken(authHeader);

    if (!tokenValidation.isValid) {
      return {
        success: false,
        error: tokenValidation.error || "Invalid token",
        status: 401,
      };
    }

    if (!tokenValidation.decoded) {
      return {
        success: false,
        error: "Invalid token payload",
        status: 401,
      };
    }

    const user = this.extractUserFromToken(tokenValidation.decoded);

    return {
      success: true,
      user,
      status: 200,
    };
  }

  static addUserHeaders(headers: Headers, user: any): void {
    headers.set("x-user-id", user.id);
    headers.set("x-user-role", user.role);
  }
}
