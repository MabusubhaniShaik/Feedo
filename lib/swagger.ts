import { controllers } from "@/lib/controllers";

const basePath = "/api";

export const generateOpenApiSpec = (): any => {
  const paths: Record<string, any> = {};
  const tags: Array<{ name: string; description?: string }> = [];

  Object.keys(controllers).forEach((collectionKey) => {
    // Use the exact key as registered (e.g., 'product-review')
    const collectionPath = `${basePath}/${collectionKey}`;
    const resourcePath = `${collectionPath}/{id}`;
    const subResourcePath = `${resourcePath}/{subResource}`;

    // Derive a readable tag name (capitalize and replace hyphens)
    const tagName = collectionKey
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    tags.push({ name: tagName, description: `Operations for ${tagName}` });

    // Collection-level endpoints: GET (list), POST (create)
    paths[collectionPath] = {
      get: {
        summary: `Retrieve all ${tagName.toLowerCase()} items`,
        operationId: `getAll${tagName.replace(/\s/g, "")}`,
        tags: [tagName],
        responses: {
          "200": {
            description: "List retrieved successfully",
            content: {
              "application/json": {
                schema: { type: "array", items: { type: "object" } },
              },
            },
          },
          "404": { description: "Collection not found" },
        },
      },
      post: {
        summary: `Create a new ${tagName.toLowerCase()}`,
        operationId: `create${tagName.replace(/\s/g, "")}`,
        tags: [tagName],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "201": { description: "Resource created" },
          "400": { description: "Invalid input" },
        },
      },
    };

    // Resource-level endpoints: GET, PUT, PATCH, DELETE by ID
    paths[resourcePath] = {
      get: {
        summary: `Retrieve a ${tagName.toLowerCase()} by ID`,
        operationId: `get${tagName.replace(/\s/g, "")}ById`,
        tags: [tagName],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Unique identifier of the resource",
          },
        ],
        responses: {
          "200": { description: "Resource found" },
          "404": { description: "Resource not found" },
        },
      },
      put: {
        summary: `Replace a ${tagName.toLowerCase()} by ID`,
        operationId: `update${tagName.replace(/\s/g, "")}ById`,
        tags: [tagName],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "200": { description: "Resource updated" } },
      },
      patch: {
        summary: `Partially update a ${tagName.toLowerCase()} by ID`,
        operationId: `patch${tagName.replace(/\s/g, "")}ById`,
        tags: [tagName],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "200": { description: "Resource partially updated" } },
      },
      delete: {
        summary: `Delete a ${tagName.toLowerCase()} by ID`,
        operationId: `delete${tagName.replace(/\s/g, "")}ById`,
        tags: [tagName],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Resource deleted" },
          "404": { description: "Resource not found" },
        },
      },
    };

    // Sub-resource endpoints (conditionally present in runtime)
    // These are documented as supported patterns
    paths[subResourcePath] = {
      get: {
        summary: `Retrieve a sub-resource of ${tagName.toLowerCase()}`,
        description: "Handled dynamically if the controller implements handleX",
        tags: [tagName],
      },
      post: { summary: `Create a sub-resource`, tags: [tagName] },
      put: { summary: `Replace a sub-resource`, tags: [tagName] },
      patch: { summary: `Partially update a sub-resource`, tags: [tagName] },
      delete: { summary: `Delete a sub-resource`, tags: [tagName] },
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        {
          name: "subResource",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Name of the sub-resource (e.g., reviews, images)",
        },
      ],
      responses: {
        "200": { description: "Sub-resource operation successful" },
        "404": { description: "Sub-resource not supported or not found" },
        "405": { description: "Method not allowed for this sub-resource" },
      },
    };
  });

  return {
    openapi: "3.0.3",
    info: {
      title: "Dynamic REST API",
      description:
        "Auto-generated OpenAPI specification for a dynamic catch-all REST API. Endpoints are derived from registered controllers.",
      version: "1.0.0",
      contact: { name: "API Support" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
      // Add production server as needed
    ],
    tags: tags.sort((a, b) => a.name.localeCompare(b.name)),
    paths,
    components: {
      schemas: {},
      securitySchemes: {
        // Example: bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  };
};
