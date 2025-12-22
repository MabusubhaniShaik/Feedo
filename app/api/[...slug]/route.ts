// app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RESTController } from "@/helpers/rest.controller";
import { RoleController } from "@/lib/controllers/RoleController";

const controllers: Record<string, RESTController<any>> = {
  role: new RoleController(),
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  return handleRequest(req, slug, "GET");
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  return handleRequest(req, slug, "POST");
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  return handleRequest(req, slug, "PUT");
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  return handleRequest(req, slug, "DELETE");
}

async function handleRequest(
  req: NextRequest,
  slug: string[] = [],
  method: string
) {
  const collection = slug[0];
  const id = slug[1]; // This is where the ID comes from for /api/role/:id

  if (!collection) {
    return NextResponse.json(
      {
        status: "FAIL",
        status_code: 400,
        error: "Collection name is required",
        data: [],
      },
      { status: 400 }
    );
  }

  const controller = controllers[collection];

  if (!controller) {
    return NextResponse.json(
      {
        status: "FAIL",
        status_code: 404,
        error: `Collection '${collection}' not found`,
        data: [],
      },
      { status: 404 }
    );
  }

  // If there's an ID in the path (e.g., /api/role/1), call getById
  // Otherwise call getAll (which also handles ?id= query param)
  switch (method) {
    case "GET":
      return id ? controller.getById(req, id) : controller.getAll(req);

    case "POST":
      return id ? controller.updateById(req, id) : controller.create(req);

    case "PUT":
    case "PATCH":
      return id
        ? controller.updateById(req, id)
        : NextResponse.json(
            {
              status: "FAIL",
              status_code: 400,
              error: "ID required",
              data: [],
            },
            { status: 400 }
          );

    case "DELETE":
      return id
        ? controller.deleteById(req, id)
        : NextResponse.json(
            {
              status: "FAIL",
              status_code: 400,
              error: "ID required",
              data: [],
            },
            { status: 400 }
          );

    default:
      return NextResponse.json(
        {
          status: "FAIL",
          status_code: 405,
          error: "Method not allowed",
          data: [],
        },
        { status: 405 }
      );
  }
}
