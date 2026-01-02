// lib/services/api.simple.service.ts

export interface ApiOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface ApiResponse<T> {
  status: "SUCCESS" | "FAIL";
  status_code: number;
  message?: string;
  data: T[];
  pagination?: {
    current_page: number;
    page_count: number;
    total_record_count: number;
    limit: number;
  };
  total_record_count?: number;
  requires_auth?: boolean;
  error?: string;
  error_details?: string[];
  [key: string]: any;
}

export class ApiService {
  private baseUrl: string = "/api";
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Get auth data directly from session storage
  private getAuthData() {
    if (typeof window === "undefined") return null;
    
    try {
      const accessToken = sessionStorage.getItem("access_token");
      const userInfoStr = sessionStorage.getItem("user_info");
      
      if (!accessToken || !userInfoStr) return null;
      
      const userInfo = JSON.parse(userInfoStr);
      return {
        token: accessToken,
        userId: userInfo.id,
        userRole: userInfo.role
      };
    } catch {
      return null;
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthData();
  }

  // Clear auth data
  clearAuth(): void {
    if (typeof window === "undefined") return;
    
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("token_type");
    sessionStorage.removeItem("expires_in");
    sessionStorage.removeItem("user_info");
  }

  // Main request method
  async request<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    data?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      headers = {},
      requiresAuth = true,
      retryCount = 0,
      timeout = 30000,
    } = options;

    // Build headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth headers if required (skip for auth endpoints)
    const isAuthEndpoint = url.startsWith("/auth/token") || url.startsWith("/auth/revoke");
    
    if (requiresAuth && !isAuthEndpoint) {
      const authData = this.getAuthData();
      if (authData) {
        requestHeaders["Authorization"] = `Bearer ${authData.token}`;
        requestHeaders["x-user-id"] = authData.userId;
        requestHeaders["x-user-role"] = authData.userRole;
      }
    }

    // Build URL
    let fullUrl = `${this.baseUrl}${url}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    // Request config
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 && requiresAuth) {
          this.clearAuth();
          throw new Error("Authentication expired");
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      const responseData: ApiResponse<T> = await response.json();

      if (responseData.status === "FAIL" && responseData.requires_auth) {
        if (requiresAuth) {
          this.clearAuth();
        }
        throw new Error(responseData.error || "Authentication required");
      }

      return responseData;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      if (retryCount > 0 && !error.message.includes("Authentication")) {
        return this.request<T>(url, method, data, {
          ...options,
          retryCount: retryCount - 1,
        });
      }

      throw error;
    }
  }

  // Convenience methods
  async get<T>(
    url: string,
    params?: Record<string, any>,
    options: Omit<ApiOptions, "params"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "GET", undefined, { ...options, params });
  }

  async post<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options: Omit<ApiOptions, "params"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "POST", data, { ...options, params });
  }

  async put<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options: Omit<ApiOptions, "params"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "PUT", data, { ...options, params });
  }

  async patch<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options: Omit<ApiOptions, "params"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "PATCH", data, { ...options, params });
  }

  async delete<T>(
    url: string,
    params?: Record<string, any>,
    options: Omit<ApiOptions, "params"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "DELETE", undefined, { ...options, params });
  }
}

// Singleton instance
export const apiService = new ApiService();

// Helper function for direct usage
export const api = {
  get: <T>(url: string, params?: Record<string, any>, options?: ApiOptions) =>
    apiService.get<T>(url, params, options),

  post: <T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options?: ApiOptions
  ) => apiService.post<T>(url, data, params, options),

  put: <T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options?: ApiOptions
  ) => apiService.put<T>(url, data, params, options),

  patch: <T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    options?: ApiOptions
  ) => apiService.patch<T>(url, data, params, options),

  delete: <T>(url: string, params?: Record<string, any>, options?: ApiOptions) =>
    apiService.delete<T>(url, params, options),

  isAuthenticated: () => apiService.isAuthenticated(),
  clearAuth: () => apiService.clearAuth(),
};