import { SITE_URL } from "../../../siteUrl";
import { TRIBE_ENTITIES } from "../../../tribeSearch/constants";
import type { OpenAPIV3_1 } from "openapi-types";

const queryParameter = (
    name: string,
    description: string,
    schema: NonNullable<OpenAPIV3_1.ParameterObject["schema"]>,
    required = false,
): OpenAPIV3_1.ParameterObject => ({
    name,
    in: "query",
    description,
    required,
    schema,
});

export const buildOpenApiDocument = (): OpenAPIV3_1.Document => ({
    openapi: "3.1.0",
    info: {
        title: "Nswap public discovery API",
        version: "1.0.0",
        description:
            "Public marketplace discovery across independent syndicated backends. Preserve serverUrl with every ID. Tribes express affiliation, not geography. Private account actions use the separately documented OAuth MCP gateway.",
    },
    servers: [{ url: SITE_URL }],
    security: [],
    externalDocs: { url: `${SITE_URL}/LLM.txt` },
    paths: {
        "/api/search/tribe": {
            get: {
                operationId: "searchByTribe",
                summary: "Find companies, products/services or jobs by authoritative tribe relationship",
                description:
                    "Provide tribe (exact name) or tribeId. q matches names/descriptions and a company's related services, not RAG. A service scan above 2,000 records per entity fails explicitly. Omitted serverUrl uses the configured default backend; this HTTP endpoint does not silently query every backend. Follow links.next to retain filters and source. No login or embedding credits required.",
                parameters: [
                    queryParameter("entity", "Entity collection", { type: "string", enum: [...TRIBE_ENTITIES] }, true),
                    queryParameter("tribe", "Exact tribe name; provide this or tribeId", {
                        type: "string",
                        minLength: 1,
                        maxLength: 100,
                    }),
                    queryParameter("tribeId", "Source-backend tribe ID; disambiguates duplicate names", {
                        type: "string",
                        minLength: 1,
                        maxLength: 100,
                    }),
                    queryParameter("serverUrl", "Public HTTPS source backend, without credentials, query or fragment", {
                        type: "string",
                        format: "uri",
                    }),
                    queryParameter(
                        "q",
                        "All-word lexical service match; web also matches website, websites and frontend",
                        { type: "string", minLength: 1, maxLength: 100 },
                    ),
                    queryParameter("format", "Use json for broadly compatible records; omitted defaults to JSON-LD", {
                        type: "string",
                        enum: ["json", "jsonld"],
                        default: "jsonld",
                    }),
                    queryParameter("page", "Page number", { type: "integer", minimum: 1, maximum: 10000, default: 1 }),
                    queryParameter("limit", "Page size", { type: "integer", minimum: 1, maximum: 100, default: 20 }),
                ],
                responses: {
                    "200": {
                        description:
                            "Records and pagination. A successful empty collection has docs=[] and totalDocs=0.",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/TribeResults" } },
                            "application/ld+json": {
                                schema: {
                                    type: "object",
                                    description:
                                        "Schema.org CollectionPage with ItemList, relationship evidence and pagination links",
                                },
                            },
                        },
                    },
                    ...Object.fromEntries(
                        [
                            { code: 400, description: "Invalid input" },
                            { code: 404, description: "Unknown tribe" },
                            { code: 409, description: "Ambiguous tribe name" },
                            { code: 429, description: "Rate limited; inspect Retry-After" },
                            { code: 502, description: "Backend failed, not an empty result" },
                            { code: 503, description: "Capacity or scan limit reached" },
                        ].map((error) => [
                            String(error.code),
                            {
                                description: error.description,
                                content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                            },
                        ]),
                    ),
                },
            },
        },
        "/api/syndication/ai/search": {
            post: {
                operationId: "searchSyndicatedContent",
                summary: "Semantic RAG search across explicitly supplied backends",
                description:
                    "Anonymous public content only. Does not forward the caller's bearer token. Costs and indexing are backend-specific; inspect every result.error even on HTTP 200. Verify citations and tribe relationships using authoritative records.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["query", "serverUrls"],
                                properties: {
                                    query: { type: "string", minLength: 1, maxLength: 600 },
                                    serverUrls: {
                                        type: "array",
                                        minItems: 1,
                                        maxItems: 8,
                                        items: { type: "string", format: "uri" },
                                    },
                                    limit: { type: "integer", minimum: 1, maximum: 20 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "results per backend and deduplicated sources; results may contain errors",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["results", "sources"],
                                    properties: {
                                        results: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                required: ["serverUrl", "sources"],
                                                properties: {
                                                    serverUrl: { type: "string", format: "uri" },
                                                    answer: { type: "string" },
                                                    error: { type: "string" },
                                                    sources: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Source" },
                                                    },
                                                },
                                            },
                                        },
                                        sources: { type: "array", items: { $ref: "#/components/schemas/Source" } },
                                    },
                                },
                            },
                        },
                    },
                    "400": { description: "Invalid input" },
                    "429": { description: "Request or RAG quota exceeded; inspect Retry-After" },
                },
            },
        },
    },
    components: {
        schemas: {
            Error: {
                type: "object",
                required: ["error"],
                properties: { code: { type: "string" }, error: { type: "string" } },
            },
            Source: {
                type: "object",
                required: ["collection", "id", "title", "serverUrl"],
                properties: {
                    collection: { type: "string" },
                    id: { type: "string" },
                    title: { type: "string" },
                    serverUrl: { type: "string", format: "uri" },
                    slug: { type: ["string", "null"] },
                },
            },
            TribeResults: {
                type: "object",
                required: [
                    "entity",
                    "tribe",
                    "serverUrl",
                    "docs",
                    "affiliationEvidence",
                    "totalDocs",
                    "page",
                    "limit",
                    "links",
                ],
                properties: {
                    entity: { type: "string", enum: [...TRIBE_ENTITIES] },
                    tribe: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            url: { type: "string", format: "uri" },
                        },
                    },
                    serverUrl: { type: "string", format: "uri" },
                    affiliationEvidence: {
                        type: "object",
                        description: "Authoritative source relationship filter, not a descriptive text match",
                    },
                    docs: {
                        type: "array",
                        items: {
                            type: "object",
                            required: ["id", "url", "serverUrl", "tribe", "description"],
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                description: { type: "string" },
                                url: { type: "string", format: "uri" },
                                serverUrl: { type: "string", format: "uri" },
                                tribe: { type: "object" },
                                website: { type: ["string", "null"] },
                                services: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            description: { type: "string" },
                                            url: { type: "string", format: "uri" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    totalDocs: { type: "integer", minimum: 0 },
                    totalPages: { type: "integer", minimum: 0 },
                    page: { type: "integer", minimum: 1 },
                    limit: { type: "integer", minimum: 1 },
                    hasNextPage: { type: "boolean" },
                    links: {
                        type: "object",
                        properties: {
                            self: { type: "string", format: "uri" },
                            next: { type: ["string", "null"], format: "uri" },
                            previous: { type: ["string", "null"], format: "uri" },
                        },
                    },
                },
            },
        },
    },
});
