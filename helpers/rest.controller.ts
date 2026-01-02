// helpers/rest.controller.ts - UPDATED
import mongoose, { Model, Document } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ResponseFormatter } from "@/helpers/response.formatter";

// Use mongoose.FilterQuery type
type FilterQuery<T> = any;

export class RESTController<T extends Document> {
  constructor(
    private model: Model<T>,
    private collectionName: string,
    private searchableFields: string[] = []
  ) {}

  // New method to get current user from request
  protected getCurrentUser(req: NextRequest): any {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");

    if (!userId || !userEmail) {
      return null;
    }

    return {
      id: userId,
      email: userEmail,
      role: userRole || "user",
    };
  }

  // New method to check permissions
  protected hasPermission(user: any, requiredRole: string = "user"): boolean {
    if (!user) return false;

    const roleHierarchy = {
      user: 1,
      manager: 2,
      admin: 3,
    };

    const userRoleLevel =
      roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  // Override this method to add user-based filters
  protected async applyUserFilter(
    filter: FilterQuery<any>,
    user: any,
    operation: string
  ): Promise<FilterQuery<any>> {
    // Default: No user-specific filtering
    return filter;
  }

  protected async preSave(
    data: any,
    operation: string,
    user?: any
  ): Promise<void> {
    // Auto-add user info to data if user is logged in
    if (user && operation === "CREATE") {
      data.createdBy = user.id;
      data.createdAt = new Date();
    }

    if (user && (operation === "UPDATE" || operation === "DELETE")) {
      data.updatedBy = user.id;
      data.updatedAt = new Date();
    }
  }

  protected async postSave(
    data: any,
    operation: string,
    user?: any
  ): Promise<void> {}

  private buildIdQuery(id: string): FilterQuery<any> {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return { _id: id };
    } else if (!isNaN(Number(id))) {
      return { id: Number(id) };
    } else {
      return { id: id };
    }
  }

  private parseQueryParams(searchParams: URLSearchParams): {
    filter: FilterQuery<any>;
    pagination: { page?: number; limit?: number };
    sort: string;
    search: string;
    idParam: string | null;
  } {
    const filter: FilterQuery<any> = {};
    const pagination: { page?: number; limit?: number } = {};

    // Get basic query parameters
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sort = searchParams.get("sort") || "-createdAt";
    const search = searchParams.get("search") || "";
    const idParam = searchParams.get("id");

    // Parse pagination
    if (page) pagination.page = Number(page);
    if (limit) pagination.limit = Number(limit);

    // Build filter from all query parameters except reserved ones
    const reservedParams = new Set([
      "page",
      "limit",
      "sort",
      "search",
      "id",
      "fields",
      "populate",
      "select",
      "skip",
      "offset",
    ]);

    for (const [key, value] of searchParams.entries()) {
      if (reservedParams.has(key)) continue;

      // Handle special operators
      if (key.endsWith("__gte")) {
        const fieldName = key.replace("__gte", "");
        filter[fieldName] = { $gte: this.parseValue(value) };
      } else if (key.endsWith("__lte")) {
        const fieldName = key.replace("__lte", "");
        filter[fieldName] = { $lte: this.parseValue(value) };
      } else if (key.endsWith("__gt")) {
        const fieldName = key.replace("__gt", "");
        filter[fieldName] = { $gt: this.parseValue(value) };
      } else if (key.endsWith("__lt")) {
        const fieldName = key.replace("__lt", "");
        filter[fieldName] = { $lt: this.parseValue(value) };
      } else if (key.endsWith("__ne")) {
        const fieldName = key.replace("__ne", "");
        filter[fieldName] = { $ne: this.parseValue(value) };
      } else if (key.endsWith("__in")) {
        const fieldName = key.replace("__in", "");
        filter[fieldName] = {
          $in: value.split(",").map((v) => this.parseValue(v.trim())),
        };
      } else if (key.endsWith("__nin")) {
        const fieldName = key.replace("__nin", "");
        filter[fieldName] = {
          $nin: value.split(",").map((v) => this.parseValue(v.trim())),
        };
      } else if (key.endsWith("__regex")) {
        const fieldName = key.replace("__regex", "");
        filter[fieldName] = { $regex: value, $options: "i" };
      } else if (key.includes(".")) {
        // Handle nested fields
        const keys = key.split(".");
        let current: any = filter;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = this.parseValue(value);
      } else {
        filter[key] = this.parseValue(value);
      }
    }

    // Handle id parameter
    if (idParam) {
      Object.assign(filter, this.buildIdQuery(idParam));
    }

    // Handle search parameter across searchable fields
    if (search && this.searchableFields.length > 0 && !idParam) {
      filter.$or = this.searchableFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    return {
      filter,
      pagination,
      sort: String(sort),
      search,
      idParam,
    };
  }

  private parseValue(value: string): any {
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return Number(value);
    }

    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private buildQueryOptions(params: {
    sort: string;
    pagination: { page?: number; limit?: number };
    originalUrl?: string;
  }): {
    sort: string;
    limit?: number;
    skip?: number;
    populate?: any;
    select?: any;
  } {
    const options: {
      sort: string;
      limit?: number;
      skip?: number;
      populate?: any;
      select?: any;
    } = {
      sort: params.sort,
    };

    if (params.pagination.limit) {
      options.limit = params.pagination.limit;
    }

    if (params.pagination.page && params.pagination.limit) {
      options.skip = (params.pagination.page - 1) * params.pagination.limit;
    }

    if (params.originalUrl) {
      const searchParams = new URLSearchParams(params.originalUrl);
      const fields = searchParams.get("fields");
      if (fields) {
        options.select = fields.split(",").join(" ");
      }

      const populate = searchParams.get("populate");
      if (populate) {
        options.populate = populate.split(",").map((field: string) => ({
          path: field.trim(),
        }));
      }
    }

    return options;
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const user = this.getCurrentUser(req);
      const body = await req.json();

      await this.preSave(body, "CREATE", user);

      const document = await this.model.create(body);
      await this.postSave(document, "CREATE", user);

      const response = ResponseFormatter.success(document, "", {
        operation: "CREATE",
        collection: this.collectionName,
        userId: user?.id,
      });

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      const response = ResponseFormatter.error(error, 400, {
        operation: "CREATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async getById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const user = this.getCurrentUser(req);
      const query = this.buildIdQuery(id);

      // Apply user-specific filtering if needed
      const userFilter = await this.applyUserFilter(query, user, "GET_BY_ID");

      const options = this.buildQueryOptions({
        sort: "-createdAt",
        pagination: {},
        originalUrl: req.url,
      });

      const document = await this.model
        .findOne(userFilter)
        .populate(options.populate || [])
        .select(options.select || {})
        .lean();

      if (!document) {
        const response = ResponseFormatter.error(
          { message: "Not found" },
          404,
          { operation: "GET_BY_ID", collection: this.collectionName }
        );
        return NextResponse.json(response, { status: 404 });
      }

      const response = ResponseFormatter.success(document, "", {
        operation: "GET_BY_ID",
        collection: this.collectionName,
        userId: user?.id,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "GET_BY_ID",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const user = this.getCurrentUser(req);
      const { searchParams } = new URL(req.url);
      const params = this.parseQueryParams(searchParams);

      // Apply user-specific filtering
      params.filter = await this.applyUserFilter(
        params.filter,
        user,
        "GET_ALL"
      );

      let documents: any[];
      let total: number;
      let pagination: any = undefined;

      const options = this.buildQueryOptions({
        ...params,
        originalUrl: req.url,
      });

      if (params.pagination.page && params.pagination.limit) {
        const page = params.pagination.page;
        const limit = params.pagination.limit;
        const skip = (page - 1) * limit;

        [documents, total] = await Promise.all([
          this.model
            .find(params.filter)
            .sort(options.sort)
            .limit(limit)
            .skip(skip)
            .populate(options.populate || [])
            .select(options.select || {})
            .lean(),
          this.model.countDocuments(params.filter),
        ]);

        pagination = {
          current_page: page,
          page_count: Math.ceil(total / limit),
          total_record_count: total,
          limit: limit,
        };
      } else {
        documents = await this.model
          .find(params.filter)
          .sort(options.sort)
          .populate(options.populate || [])
          .select(options.select || {})
          .lean();

        total = documents.length;
      }

      const operation = params.idParam ? "GET_BY_ID" : "GET_ALL";
      const metadata: any = {
        operation,
        collection: this.collectionName,
        userId: user?.id,
        total: total,
      };

      if (pagination) {
        metadata.pagination = pagination;
      }

      const response = ResponseFormatter.success(documents, "", metadata);
      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "GET_ALL",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async updateById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const user = this.getCurrentUser(req);
      const body = await req.json();

      await this.preSave({ ...body, id }, "UPDATE", user);

      const query = this.buildIdQuery(id);
      // Apply user-specific filtering for update
      const userFilter = await this.applyUserFilter(query, user, "UPDATE");

      const document = await this.model
        .findOneAndUpdate(
          userFilter,
          { $set: body },
          { new: true, runValidators: true }
        )
        .lean();

      if (!document) {
        const response = ResponseFormatter.error(
          { message: "Not found or access denied" },
          404,
          { operation: "UPDATE", collection: this.collectionName }
        );
        return NextResponse.json(response, { status: 404 });
      }

      await this.postSave(document, "UPDATE", user);

      const response = ResponseFormatter.success(document, "", {
        operation: "UPDATE",
        collection: this.collectionName,
        userId: user?.id,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response = ResponseFormatter.error(error, 400, {
        operation: "UPDATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async deleteById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const user = this.getCurrentUser(req);

      await this.preSave({ id }, "DELETE", user);

      const query = this.buildIdQuery(id);
      // Apply user-specific filtering for delete
      const userFilter = await this.applyUserFilter(query, user, "DELETE");

      const document = await this.model.findOneAndDelete(userFilter).lean();

      if (!document) {
        const response = ResponseFormatter.error(
          { message: "Not found or access denied" },
          404,
          { operation: "DELETE", collection: this.collectionName }
        );
        return NextResponse.json(response, { status: 404 });
      }

      await this.postSave(document, "DELETE", user);

      const response = ResponseFormatter.success(document, "", {
        operation: "DELETE",
        collection: this.collectionName,
        userId: user?.id,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "DELETE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }
}
