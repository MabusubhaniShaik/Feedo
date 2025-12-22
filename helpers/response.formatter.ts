// helpers/response.formatter.ts
export class ResponseFormatter {
  static success<T>(
    data: T | T[],
    message: string = "",
    options?: {
      pagination?: {
        current_page: number;
        page_count: number;
        total_record_count: number;
        limit: number;
      };
      operation?: string;
      collection?: string;
    }
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

    if (options?.pagination) {
      response.pagination = {
        current_page: options.pagination.current_page,
        page_count: options.pagination.page_count,
        total_record_count: options.pagination.total_record_count,
        limit: options.pagination.limit,
      };
    } else {
      response.total_record_count = isArray ? data.length : 1;
    }

    return response;
  }

  static error(
    error: any,
    status_code: number = 500,
    options?: {
      operation?: string;
      collection?: string;
    }
  ) {
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

    if (error.errors) {
      response.error_details = Object.values(error.errors).map(
        (err: any) => err.message
      );
    } else if (error.message) {
      response.error_details = [error.message];
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
          return `${collection} Collection Fetched Successfully`;
        case "GET_BY_ID":
          return `${collection} Fetched Successfully`;
        case "CREATE":
          return `${collection} Created Successfully`;
        case "UPDATE":
          return `${collection} Updated Successfully`;
        case "DELETE":
          return `${collection} Deleted Successfully`;
        default:
          return `${collection} ${operation} Operation Successful`;
      }
    }
    return baseMessage;
  }

  private static formatErrorMessage(
    error: any,
    operation?: string,
    collection?: string
  ): string {
    let message = "Operation failed";

    if (operation && collection) {
      message = `${collection} ${operation.replace("_", " ")} Failed`;
    }

    if (error.name === "ValidationError") {
      return `${message}: Validation error`;
    } else if (error.code === 11000) {
      return `${message}: Duplicate entry found`;
    } else if (error.message) {
      // Use the actual error message instead of "Invalid ID format"
      return error.message;
    }

    return message;
  }
}
