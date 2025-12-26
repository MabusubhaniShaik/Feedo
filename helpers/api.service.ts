// lib/services/api.simple.service.ts
export const apiService = {
  async request<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    data?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let fullUrl = `/api${url}`;
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

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  get<T>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, "GET", undefined, params, headers);
  },

  post<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, "POST", data, params, headers);
  },

  put<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, "PUT", data, params, headers);
  },

  patch<T>(
    url: string,
    data?: any,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, "PATCH", data, params, headers);
  },

  delete<T>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, "DELETE", undefined, params, headers);
  },
};
