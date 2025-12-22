// app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RESTController } from "@/helpers/rest.controller";
import { connectDB } from "@/lib/db";

await connectDB();

const controllers: Record<string, RESTController<any>> = {};

// Load controllers one by one with better error handling
const loadController = async (name: string, displayName?: string) => {
  try {
    const module = await import(`@/lib/controllers/${name}.controller`);

    const ControllerClass =
      module.default ||
      Object.values(module).find(
        (exported: any) =>
          typeof exported === "function" && exported.name.endsWith("Controller")
      );

    if (ControllerClass) {
      const controllerKey = displayName || name;
      controllers[controllerKey] = new ControllerClass();
      console.log(` Loaded controller: ${controllerKey}`);
      return true;
    }
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.log(` Controller not found: ${name}.controller.ts`);
    } else {
      console.log(`rror loading ${name} controller:`, error.message);
    }
  }
  return false;
};

// Load role controller
await loadController("role");

// Load user controller and register both singular and plural
const userLoaded = await loadController("user");
if (userLoaded) {
  controllers["users"] = controllers["user"];
}

console.log(
  "📋 Available endpoints:",
  Object.keys(controllers)
    .map((c) => `/api/${c}`)
    .join(", ")
);

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
  let collection = slug[0];
  const id = slug[1];

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

  switch (method) {
    case "GET":
      return id ? controller.getById(req, id) : controller.getAll(req);

    case "POST":
      return id ? controller.updateById(req, id) : controller.create(req);

    case "PUT":
    case "PATCH":
      return id
        ? controller.updateById(req, id)
        : NextResponse.json({ error: "ID required" }, { status: 400 });

    case "DELETE":
      return id
        ? controller.deleteById(req, id)
        : NextResponse.json({ error: "ID required" }, { status: 400 });

    default:
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
  }
}
