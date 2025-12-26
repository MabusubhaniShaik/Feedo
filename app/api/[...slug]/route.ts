// app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { controllers } from "@/lib/controllers";

// Connect to database once
connectDB().catch(console.error);

// Log available endpoints (only in development)
if (process.env.NODE_ENV === "development") {
  console.log(
    "Available endpoints:",
    Object.keys(controllers)
      .map((c) => `/api/${c}`)
      .join(", ")
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return handleRequest(req, await context.params, "GET");
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return handleRequest(req, await context.params, "POST");
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return handleRequest(req, await context.params, "PUT");
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return handleRequest(req, await context.params, "PATCH");
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return handleRequest(req, await context.params, "DELETE");
}

async function handleRequest(
  req: NextRequest,
  params: { slug: string[] },
  method: string
) {
  const { slug = [] } = params;
  let collection = slug[0];
  const id = slug[1];
  const subResource = slug[2]; // Optional sub-resource

  // Validate collection
  if (!collection) {
    return NextResponse.json(
      { error: "Collection name is required" },
      { status: 400 }
    );
  }

  // Auto-convert plural to singular
  if (collection.endsWith("s") && !controllers[collection]) {
    const singular = collection.slice(0, -1);
    if (controllers[singular]) {
      collection = singular;
    }
  }

  const controller = controllers[collection];

  if (!controller) {
    return NextResponse.json(
      {
        error: `Collection '${slug[0]}' not found`,
        available: Object.keys(controllers),
      },
      { status: 404 }
    );
  }

  try {
    // Handle different HTTP methods
    switch (method) {
      case "GET":
        if (id && subResource) {
          // Handle sub-resource: GET /api/:collection/:id/:subResource
          return handleSubResource(req, controller, id, subResource, "GET");
        }
        return id ? controller.getById(req, id) : controller.getAll(req);

      case "POST":
        if (id && subResource) {
          // Handle sub-resource: POST /api/:collection/:id/:subResource
          return handleSubResource(req, controller, id, subResource, "POST");
        }
        if (id) {
          // POST with ID should be invalid for base collection
          return NextResponse.json(
            {
              error:
                "POST to resource with ID is not allowed. Use PUT or PATCH instead.",
            },
            { status: 405 }
          );
        }
        return controller.create(req);

      case "PUT":
        if (id && subResource) {
          // Handle sub-resource: PUT /api/:collection/:id/:subResource
          return handleSubResource(req, controller, id, subResource, "PUT");
        }
        if (!id) {
          return NextResponse.json(
            { error: "ID is required for PUT" },
            { status: 400 }
          );
        }
        // PUT is typically for full resource replacement
        return controller.updateById(req, id);

      case "PATCH":
        if (id && subResource) {
          // Handle sub-resource: PATCH /api/:collection/:id/:subResource
          return handleSubResource(req, controller, id, subResource, "PATCH");
        }
        if (!id) {
          return NextResponse.json(
            { error: "ID is required for PATCH" },
            { status: 400 }
          );
        }
        // PATCH is for partial updates
        if (controller.updateById) {
          return controller.updateById(req, id);
        }
        // Fallback to updateById if patchById doesn't exist
        return controller.updateById(req, id);

      case "DELETE":
        if (id && subResource) {
          // Handle sub-resource: DELETE /api/:collection/:id/:subResource
          return handleSubResource(req, controller, id, subResource, "DELETE");
        }
        if (!id) {
          return NextResponse.json(
            { error: "ID is required for DELETE" },
            { status: 400 }
          );
        }
        return controller.deleteById(req, id);

      default:
        return NextResponse.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
    }
  } catch (error) {
    console.error(`Error handling ${method} request for ${collection}:`, error);

    // Handle different types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function for handling sub-resources
async function handleSubResource(
  req: NextRequest,
  controller: any,
  id: string,
  subResource: string,
  method: string
) {
  const handlerName = `handle${
    subResource.charAt(0).toUpperCase() + subResource.slice(1)
  }`;

  if (typeof controller[handlerName] === "function") {
    return controller[handlerName](req, id, method);
  }

  return NextResponse.json(
    { error: `Sub-resource '${subResource}' not supported` },
    { status: 404 }
  );
}

// Handle unsupported methods
export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function OPTIONS(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json(
    {},
    {
      headers: {
        Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
