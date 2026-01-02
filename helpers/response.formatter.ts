// helpers/response.formatter.ts

export interface ResponseOptions {
  pagination?: {
    current_page: number;
    page_count: number;
    total_record_count: number;
    limit: number;
  };
  operation?: string;
  collection?: string;
  userId?: string;
  total?: number;
  requiresAuth?: boolean;
  metadata?: Record<string, any>;
}

export interface ErrorOptions {
  operation?: string;
  collection?: string;
  requiresAuth?: boolean;
  userId?: string;
}

export class ResponseFormatter {
  static success<T>(
    data: T | T[],
    message: string = "",
    options?: ResponseOptions
  ) {
    const isArray = Array.isArray(data);
    const response: any = {
      status: "SUCCESS",
      status_code: 200,
      message: this.formatMessage(
        message,
        options?.operation,
        options?.collection
      ),
      data: isArray ? data : [data],
    };

    // Add total record count
    if (options?.pagination) {
      response.pagination = {
        current_page: options.pagination.current_page,
        page_count: options.pagination.page_count,
        total_record_count: options.pagination.total_record_count,
        limit: options.pagination.limit,
      };
    } else if (options?.total !== undefined) {
      response.total_record_count = options.total;
    } else {
      response.total_record_count = isArray ? data.length : 1;
    }

    // Add metadata if provided
    if (options?.metadata) {
      response.metadata = options.metadata;
    }

    // Add auth info if needed
    if (options?.requiresAuth !== undefined) {
      response.requires_auth = options.requiresAuth;
    }

    // Add user info if available
    if (options?.userId) {
      response.user_id = options.userId;
    }

    return response;
  }

  static error(error: any, status_code: number = 500, options?: ErrorOptions) {
    const message = this.formatErrorMessage(
      error,
      options?.operation,
      options?.collection
    );

    const response: any = {
      status: "FAIL",
      status_code,
      error: message,
      data: [],
    };

    // Add error details
    if (error.errors) {
      response.error_details = Object.values(error.errors).map(
        (err: any) => err.message
      );
    } else if (error.message) {
      response.error_details = [error.message];
    }

    // Add auth info for 401/403 errors
    if (status_code === 401 || status_code === 403) {
      response.requires_auth = true;
      response.auth_error = true;
    }

    // Add operation/collection context
    if (options?.operation || options?.collection) {
      response.context = {
        operation: options.operation,
        collection: options.collection,
      };
    }

    // Add user info if available
    if (options?.userId) {
      response.user_id = options.userId;
    }

    // Add requiresAuth flag if provided
    if (options?.requiresAuth !== undefined) {
      response.requires_auth = options.requiresAuth;
    }

    return response;
  }

  private static formatMessage(
    baseMessage: string,
    operation?: string,
    collection?: string
  ): string {
    if (operation && collection) {
      switch (operation.toUpperCase()) {
        case "GET_ALL":
          return `${collection} fetched successfully`;
        case "GET_BY_ID":
          return `${collection} fetched successfully`;
        case "CREATE":
          return `${collection} created successfully`;
        case "UPDATE":
          return `${collection} updated successfully`;
        case "DELETE":
          return `${collection} deleted successfully`;
        case "LOGIN":
          return "Login successful";
        case "REGISTER":
          return "Registration successful";
        case "LOGOUT":
          return "Logout successful";
        default:
          return `${operation} operation successful`;
      }
    }
    return baseMessage || "Operation successful";
  }

  private static formatErrorMessage(
    error: any,
    operation?: string,
    collection?: string
  ): string {
    let message = "Operation failed";

    if (operation && collection) {
      switch (operation.toUpperCase()) {
        case "GET_ALL":
          message = `Failed to fetch ${collection} collection`;
          break;
        case "GET_BY_ID":
          message = `Failed to fetch ${collection}`;
          break;
        case "CREATE":
          message = `Failed to create ${collection}`;
          break;
        case "UPDATE":
          message = `Failed to update ${collection}`;
          break;
        case "DELETE":
          message = `Failed to delete ${collection}`;
          break;
        default:
          message = `${operation.replace("_", " ")} failed for ${collection}`;
      }
    }

    // Handle specific error types
    if (error.name === "ValidationError") {
      return `${message}: Validation error`;
    } else if (error.code === 11000) {
      return `${message}: Duplicate entry found`;
    } else if (error.name === "CastError") {
      return `${message}: Invalid ID format`;
    } else if (error.name === "MongoError") {
      return `${message}: Database error`;
    } else if (error.message) {
      // Use the actual error message
      return error.message;
    }

    return message;
  }

  // Helper for auth-specific responses
  static authError(
    message: string = "Authentication required",
    status_code: number = 401,
    options?: {
      operation?: string;
      collection?: string;
      requiresAuth?: boolean;
    }
  ) {
    return this.error({ message }, status_code, {
      ...options,
      requiresAuth: options?.requiresAuth ?? true,
    });
  }

  // Helper for permission errors
  static permissionError(
    message: string = "Insufficient permissions",
    options?: {
      operation?: string;
      collection?: string;
      userId?: string;
    }
  ) {
    return this.error({ message }, 403, {
      ...options,
      requiresAuth: true,
    });
  }
}
