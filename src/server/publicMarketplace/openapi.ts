import type { OpenAPIV3_1 } from "openapi-types";
import { MCP_ENTITIES } from "../../mcp/types";
import { MAX_PUBLIC_BACKENDS, PUBLIC_MARKETPLACE_ENTITIES, PUBLIC_MARKETPLACE_TOOLS } from "./constants";

/** Describe one URL query parameter in the generated OpenAPI document; this does not validate requests. */
const parameter = (
    name: string,
    schema: NonNullable<OpenAPIV3_1.ParameterObject["schema"]>,
    description: string,
    required = false,
): OpenAPIV3_1.ParameterObject => ({
    name,
    in: "query",
    required,
    description,
    schema,
});
const entity = parameter(
    "entity",
    { type: "string", enum: [...PUBLIC_MARKETPLACE_ENTITIES] },
    "Public collection; private accounts, orders and reports are not exposed.",
    true,
);
const page = parameter(
    "page",
    { type: "integer", minimum: 1, maximum: 10000, default: 1 },
    "Page number, shared across requested backends.",
);
const limit = parameter(
    "limit",
    { type: "integer", minimum: 1, maximum: 100, default: 20 },
    "Maximum records per backend.",
);
const query = parameter(
    "query",
    { type: "string", minLength: 1, maxLength: 200 },
    "Marketplace text search, not semantic RAG.",
    true,
);
const where = parameter(
    "where",
    { type: "string", maxLength: 8000 },
    'URL-encoded JSON object with backend-supported filters. Read schema first; for example {"orderable":{"equals":true}}.',
);
// OpenAPI's form/explode encoding represents repeated ?serverUrl=...&serverUrl=... parameters.
const serverUrl: OpenAPIV3_1.ParameterObject = {
    ...parameter(
        "serverUrl",
        { type: "array", minItems: 1, maxItems: MAX_PUBLIC_BACKENDS, items: { type: "string", format: "uri" } },
        "Public HTTPS backend; repeat for multiple backends. Omitted uses the configured default, not a private MCP session.",
    ),
    style: "form",
    explode: true,
};

/** List each operation's documented inputs, excluding the shared backend selector added below. */
const operationParameters = (operation: keyof typeof PUBLIC_MARKETPLACE_TOOLS): OpenAPIV3_1.ParameterObject[] => {
    switch (operation) {
        case "list":
            return [
                entity,
                page,
                limit,
                where,
                parameter(
                    "search",
                    { type: "string", minLength: 1, maxLength: 200 },
                    "The same optional search argument accepted by the MCP list tool.",
                ),
            ];
        case "search":
            return [entity, query, page, limit, where];
        case "get":
            return [
                entity,
                parameter("id", { type: "string", minLength: 1, maxLength: 100 }, "Backend-qualified entity ID.", true),
            ];
        case "related":
            return [
                entity,
                { ...entity, name: "relatedEntity" },
                parameter(
                    "relatedField",
                    { type: "string", pattern: "^[A-Za-z][A-Za-z0-9_]*$", maxLength: 100 },
                    "Relationship field on the related entity; inspect schema first.",
                    true,
                ),
                parameter(
                    "relatedId",
                    { type: "string", minLength: 1, maxLength: 100 },
                    "Source entity ID on the same backend.",
                    true,
                ),
                page,
                limit,
            ];
        case "compare":
            return [query, limit, where];
        case "schema":
            return [
                {
                    ...entity,
                    schema: { type: "string", enum: [...MCP_ENTITIES] },
                    description:
                        "Entity field, filter, create/update and permission metadata; does not expose private records.",
                },
            ];
        default:
            return [];
    }
};

/**
 * Build the eight public GET route descriptions included in /openapi.json.
 * The route-to-tool map supplies the operation names; parameter and response
 * descriptions tell HTTP agents how to read results, preserve backend provenance,
 * follow pagination and distinguish partial failures from empty collections.
 * Runtime validation belongs to schema.ts; this method only publishes API docs.
 */
export const buildPublicMarketplacePaths = (): OpenAPIV3_1.PathsObject =>
    Object.fromEntries(
        Object.entries(PUBLIC_MARKETPLACE_TOOLS).map(([name, tool]) => {
            const operation = name as keyof typeof PUBLIC_MARKETPLACE_TOOLS;
            return [
                `/api/marketplace/${operation}`,
                {
                    get: {
                        operationId: `publicMarketplace_${operation}`,
                        summary: `Public ${tool} without an MCP client`,
                        description:
                            "Runs the existing read-only tool anonymously. Caller credentials are never forwarded. results contain authoritative outer serverUrl plus decoded result or error per backend. Preserve that outer source with every ID. Partial backend failures return 200 with explicit errors; all-backend failures return 502. Backend pagination stays in result; follow links.next for continuation. GET does not alter MCP sessions or publish, delete, purchase or pay anything.",
                        parameters: [
                            operation === "servers"
                                ? parameter(
                                      "serverUrl",
                                      { type: "string", format: "uri" },
                                      "Optional root for bounded recursive discovery; defaults to the configured backend.",
                                  )
                                : serverUrl,
                            ...operationParameters(operation),
                        ],
                        responses: {
                            "200": {
                                description:
                                    "Source-qualified tool results, including explicit empty collections and discovery truncation where applicable.",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            required: ["results", "links"],
                                            properties: {
                                                results: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        required: ["serverUrl"],
                                                        properties: {
                                                            serverUrl: { type: "string", format: "uri" },
                                                            result: {
                                                                description:
                                                                    "Decoded backend tool data; lists include docs, totalDocs and pagination. No MCP content envelopes.",
                                                            },
                                                            error: { type: "string" },
                                                        },
                                                    },
                                                },
                                                links: {
                                                    type: "object",
                                                    properties: {
                                                        self: { type: "string", format: "uri" },
                                                        next: {
                                                            anyOf: [
                                                                { type: "string", format: "uri" },
                                                                { enum: [null] },
                                                            ],
                                                        },
                                                        previous: {
                                                            anyOf: [
                                                                { type: "string", format: "uri" },
                                                                { enum: [null] },
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            "400": { description: "Invalid operation, public entity, filters or backend URL." },
                            "405": { description: "Only GET is supported." },
                            "429": { description: "Request limit reached; inspect Retry-After." },
                            "502": { description: "All backends failed, or gateway unavailable; not an empty result." },
                            "503": { description: "Concurrent request capacity reached; inspect Retry-After." },
                        },
                    },
                },
            ];
        }),
    );
