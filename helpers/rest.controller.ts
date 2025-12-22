// helpers/rest.controller.ts
import { Model, Document } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ResponseFormatter } from "@/helpers/response.formatter";

export class RESTController<T extends Document> {
  constructor(
    private model: Model<T>,
    private collectionName: string,
    private searchableFields: string[] = []
  ) {}

  protected async preSave(data: any, operation: string): Promise<void> {
    const now = new Date();
    if (operation === "CREATE") {
      if (!data.created_date) data.created_date = now;
      if (!data.updated_date) data.updated_date = now;
      if (!data.created_by) data.created_by = "system";
    }
    if (operation === "UPDATE") {
      data.updated_date = now;
      if (!data.updated_by) data.updated_by = "system";
    }
  }

  protected async postSave(data: any, operation: string): Promise<void> {}

  private buildIdQuery(id: string): any {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return { _id: id };
    } else if (!isNaN(Number(id))) {
      return { id: Number(id) };
    } else {
      return { id: id };
    }
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      await this.preSave(body, "CREATE");
      const document = await this.model.create(body);
      await this.postSave(document, "CREATE");
      const response = ResponseFormatter.success(document, "", {
        operation: "CREATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      const response = ResponseFormatter.error(error, 400, {
        operation: "CREATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const page = Number(searchParams.get("page"));
      const limit = Number(searchParams.get("limit"));
      const sort = searchParams.get("sort") || "-created_date";
      const search = searchParams.get("search") || "";
      const idParam = searchParams.get("id");

      const filter: Record<string, any> = {};

      if (idParam) {
        Object.assign(filter, this.buildIdQuery(idParam));
      }

      if (search && this.searchableFields.length > 0 && !idParam) {
        filter.$or = this.searchableFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
      }

      let documents: any[];
      let total: number;
      let pagination: any = undefined;

      if (page && limit) {
        [documents, total] = await Promise.all([
          this.model
            .find(filter)
            .sort(String(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .lean(),
          this.model.countDocuments(filter),
        ]);
        pagination = {
          current_page: page,
          page_count: Math.ceil(total / limit),
          total_record_count: total,
          limit,
        };
      } else {
        documents = await this.model.find(filter).sort(String(sort)).lean();
        total = documents.length;
      }

      const operation = idParam ? "GET_BY_ID" : "GET_ALL";
      const response = ResponseFormatter.success(documents, "", {
        operation,
        collection: this.collectionName,
        pagination,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "GET_ALL",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async getById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const query = this.buildIdQuery(id);
      const document = await this.model.findOne(query).lean();

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
      });
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "GET_BY_ID",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async updateById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      await this.preSave({ ...body, id }, "UPDATE");
      const query = this.buildIdQuery(id);
      const document = await this.model
        .findOneAndUpdate(
          query,
          { $set: body },
          { new: true, runValidators: true }
        )
        .lean();

      if (!document) {
        const response = ResponseFormatter.error(
          { message: "Not found" },
          404,
          { operation: "UPDATE", collection: this.collectionName }
        );
        return NextResponse.json(response, { status: 404 });
      }

      await this.postSave(document, "UPDATE");
      const response = ResponseFormatter.success(document, "", {
        operation: "UPDATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const response = ResponseFormatter.error(error, 400, {
        operation: "UPDATE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }

  async deleteById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      await this.preSave({ id }, "DELETE");
      const query = this.buildIdQuery(id);
      const document = await this.model.findOneAndDelete(query).lean();

      if (!document) {
        const response = ResponseFormatter.error(
          { message: "Not found" },
          404,
          { operation: "DELETE", collection: this.collectionName }
        );
        return NextResponse.json(response, { status: 404 });
      }

      await this.postSave(document, "DELETE");
      const response = ResponseFormatter.success(document, "", {
        operation: "DELETE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const response = ResponseFormatter.error(error, 500, {
        operation: "DELETE",
        collection: this.collectionName,
      });
      return NextResponse.json(response, { status: response.status_code });
    }
  }
}
