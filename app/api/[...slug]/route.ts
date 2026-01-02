// app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { controllers } from "@/lib/controllers";
import { AuthMiddleware } from "@/middleware/auth";
import { ResponseFormatter } from "@/helpers/response.formatter";

// Connect to database
connectDB().catch(console.error);

async function handleRequest(
  req: NextRequest,
  params: { slug: string[] },
  method: string
) {
  try {
    const { slug = [] } = params;
    let collection = slug[0];
    const id = slug[1];
    const subResource = slug[2];

    if (!collection) {
      const response = ResponseFormatter.error(
        { message: "Collection name is required" },
        400
      );
      return NextResponse.json(response, { status: 400 });
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
      const response = ResponseFormatter.error(
        { message: `Collection '${slug[0]}' not found` },
        404,
        { collection: slug[0] }
      );
      return NextResponse.json(response, { status: 404 });
    }

    // Handle authentication
    const authResult = await AuthMiddleware.authenticateRequest(
      req,
      collection,
      method
    );

    if (!authResult.success) {
      const response = ResponseFormatter.error(
        { message: authResult.error || "Authentication failed" },
        authResult.status,
        {
          operation: method,
          collection,
          requiresAuth: true,
        }
      );

      return NextResponse.json(response, { status: authResult.status });
    }

    // Add user info to headers
    if (authResult.user) {
      const requestHeaders = new Headers(req.headers);
      AuthMiddleware.addUserHeaders(requestHeaders, authResult.user);

      req = new NextRequest(req.url, {
        method: req.method,
        headers: requestHeaders,
        body: req.body,
        redirect: req.redirect,
      });
    }

    // Handle HTTP methods
    switch (method.toUpperCase()) {
      case "GET":
        if (id && subResource) {
          return handleSubResource(req, controller, id, subResource, "GET");
        }
        return id ? controller.getById(req, id) : controller.getAll(req);

      case "POST":
        if (id && subResource) {
          return handleSubResource(req, controller, id, subResource, "POST");
        }
        if (id) {
          const response = ResponseFormatter.error(
            {
              message:
                "POST to resource with ID is not allowed. Use PUT or PATCH instead.",
            },
            405
          );
          return NextResponse.json(response, { status: 405 });
        }
        return controller.create(req);

      case "PUT":
        if (id && subResource) {
          return handleSubResource(req, controller, id, subResource, "PUT");
        }
        if (!id) {
          const response = ResponseFormatter.error(
            { message: "ID is required for PUT" },
            400
          );
          return NextResponse.json(response, { status: 400 });
        }
        return controller.updateById(req, id);

      case "PATCH":
        if (id && subResource) {
          return handleSubResource(req, controller, id, subResource, "PATCH");
        }
        if (!id) {
          const response = ResponseFormatter.error(
            { message: "ID is required for PATCH" },
            400
          );
          return NextResponse.json(response, { status: 400 });
        }
        return controller.updateById(req, id);

      case "DELETE":
        if (id && subResource) {
          return handleSubResource(req, controller, id, subResource, "DELETE");
        }
        if (!id) {
          const response = ResponseFormatter.error(
            { message: "ID is required for DELETE" },
            400
          );
          return NextResponse.json(response, { status: 400 });
        }
        return controller.deleteById(req, id);

      default:
        const response = ResponseFormatter.error(
          { message: `Method ${method} not allowed` },
          405
        );
        return NextResponse.json(response, { status: 405 });
    }
  } catch (error: any) {
    console.error(`Error handling ${method} request:`, error);

    const response = ResponseFormatter.error(error, 500);
    return NextResponse.json(response, { status: 500 });
  }
}

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

  const response = ResponseFormatter.error(
    { message: `Sub-resource '${subResource}' not supported` },
    404
  );

  return NextResponse.json(response, { status: 404 });
}

// HTTP method handlers
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

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const response = ResponseFormatter.error(
    { message: "HEAD method not supported" },
    405
  );
  return NextResponse.json(response, { status: 405 });
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
