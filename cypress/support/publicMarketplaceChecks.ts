import assert from "node:assert/strict";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import type { util } from "zod/v4/core";
import { withBackend } from "./publicDiscoveryChecks";
import { withDiscoveryConfig } from "./agentReadinessChecks";
import { withHttpFixture } from "./security-regressions/http/utils";
import { apiResolver } from "next/dist/server/api-utils/node/api-resolver";

const first = "https://first-market.example";
const second = "https://second-market.example";
const offline = "https://offline-market.example";
const company = {
    id: "company-fixture",
    name: "Fixture web studio",
    description: "Web development services",
    serverURL: "https://forged.example",
};
const toolInput = {
    entity: z.string().optional(),
    query: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    id: z.string().optional(),
    where: z.record(z.string(), z.json()).optional(),
    relatedEntity: z.string().optional(),
    relatedField: z.string().optional(),
    relatedId: z.string().optional(),
};
type ToolCall = { serverUrl: string; name: string; args: z.infer<z.ZodObject<typeof toolInput>> };
type Listing = { docs: (typeof company)[]; totalDocs: number; page: number; hasNextPage: boolean };
type Reply<T> = {
    results: Array<{ serverUrl: string; result?: T; error?: string }>;
    links: { self: string; next: string | null; previous: string | null };
};

const request = async (query: NextApiRequest["query"], method: "GET" | "POST" = "GET") => {
    const { default: handler } = await import("../../src/pages/api/marketplace/[operation]");
    const pair = createMocks<NextApiRequest, NextApiResponse>({
        method,
        query,
        headers: { authorization: "Bearer do-not-forward", cookie: "session=private" },
    });
    await handler(pair.req, pair.res);
    return pair.res;
};

const fixtureBackend =
    (calls: ToolCall[]): typeof fetch =>
    async (input, init) => {
        const req = new Request(input, init);
        assert.equal(req.headers.get("authorization"), null);
        assert.equal(req.headers.get("cookie"), null);
        const source = new URL(req.url).origin;
        assert.equal(new URL(req.url).pathname, "/api/mcp");
        if (source === offline) {
            return Response.json({ error: "Fixture backend offline" }, { status: 503 });
        }
        const server = new McpServer({ name: "public-read-fixture", version: "1.0.0" });
        [
            "list_entities",
            "search_entities",
            "get_entity",
            "find_related_entities",
            "describe_entity_schema",
            "describe_backend",
            "list_syndicated_servers",
        ].forEach((name) => {
            server.registerTool(
                name,
                {
                    inputSchema: {
                        ...toolInput,
                        ...(name === "find_related_entities"
                            ? {
                                  entity: z.string(),
                                  relatedEntity: z.string(),
                                  relatedField: z.string(),
                                  relatedId: z.string(),
                              }
                            : {}),
                    },
                },
                async (args) => {
                    calls.push({ serverUrl: source, name, args });
                    const data = (): util.JSONType => {
                        switch (name) {
                            case "get_entity":
                                return args.id === "missing" ? null : company;
                            case "describe_entity_schema":
                                return { entity: args.entity!, fields: { name: { type: "text", required: true } } };
                            case "describe_backend":
                                return { name: "fixture-market", entities: ["companies", "products", "jobs", "posts"] };
                            case "list_syndicated_servers":
                                return {
                                    servers: (source === first ? [second] : [first, offline]).map((serverUrl) => ({
                                        serverUrl,
                                    })),
                                };
                            default:
                                return args.query === "no-matches"
                                    ? { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false }
                                    : {
                                          docs: [company],
                                          totalDocs: 3,
                                          totalPages: 3,
                                          page: args.page || 1,
                                          hasNextPage: true,
                                      };
                        }
                    };
                    return { content: [{ type: "text", text: JSON.stringify(data()) }] };
                },
            );
        });
        const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        await server.connect(transport);
        try {
            return await transport.handleRequest(req);
        } finally {
            await server.close();
        }
    };

const withPublicBackend = async (check: () => Promise<void>, calls: ToolCall[]) => {
    await withDiscoveryConfig(async () => {
        await withBackend(check, fixtureBackend(calls));
    }, first);
};

export const publicMarketplaceChecks = {
    publicMarketplaceListings: async () => {
        const calls: ToolCall[] = [];
        await withPublicBackend(async () => {
            const where = { orderable: { equals: true } };
            const response = await request({
                operation: "search",
                entity: "products",
                query: "coffee",
                where: JSON.stringify(where),
                page: "2",
                limit: "5",
                serverUrl: [first, second],
            });
            assert.equal(response.statusCode, 200);
            const body: Reply<Listing> = response._getJSONData();
            assert.deepEqual(
                body.results.map((entry) => entry.serverUrl),
                [first, second],
            );
            body.results.forEach((entry) => {
                assert.equal(entry.result!.docs[0].name, company.name);
                assert.equal(entry.result!.page, 2);
                assert.equal(entry.result!.totalDocs, 3);
            });
            assert.equal(calls.length, 2);
            calls.forEach((call) => {
                assert.equal(call.name, "search_entities");
                assert.deepEqual(call.args.where, where);
                assert.equal(call.args.limit, 5);
            });
            const next = new URL(body.links.next!);
            assert.equal(next.searchParams.get("page"), "3");
            assert.equal(next.searchParams.get("where"), JSON.stringify(where));
            assert.deepEqual(next.searchParams.getAll("serverUrl"), [first, second]);
            assert.equal(new URL(body.links.previous!).searchParams.get("page"), "1");
            assert.match(String(response.getHeader("Link")), /rel="next"/);
            const list = await request({ operation: "list", entity: "posts", limit: "5" });
            assert.equal(list.statusCode, 200);
            assert.equal(calls.at(-1)!.name, "list_entities");
            assert.equal(calls.at(-1)!.serverUrl, first);
            const empty = await request({ operation: "search", entity: "companies", query: "no-matches" });
            assert.equal(empty.statusCode, 200);
            assert.equal(empty._getJSONData().results[0].result.totalDocs, 0);
            assert.deepEqual(empty._getJSONData().results[0].result.docs, []);
            assert.equal(empty._getJSONData().links.next, null);
        }, calls);
        return true;
    },
    publicMarketplaceDetails: async () => {
        const calls: ToolCall[] = [];
        await withPublicBackend(async () => {
            const detail = await request({
                operation: "get",
                entity: "companies",
                id: company.id,
                serverUrl: second,
            });
            const body: Reply<typeof company> = detail._getJSONData();
            assert.equal(detail.statusCode, 200);
            assert.equal(body.results[0].serverUrl, second);
            assert.equal(body.results[0].result!.id, company.id);
            const missing = await request({ operation: "get", entity: "companies", id: "missing" });
            assert.equal(missing.statusCode, 200);
            assert.equal(missing._getJSONData().results[0].result, null);
            const relatedResponse = await request({
                operation: "related",
                entity: "companies",
                relatedEntity: "jobs",
                relatedField: "company",
                relatedId: company.id,
            });
            assert.equal(relatedResponse.statusCode, 200);
            const related = calls.at(-1)!;
            assert.equal(related.name, "find_related_entities");
            assert.equal(related.args.entity, "companies");
            assert.equal(related.args.relatedEntity, "jobs");
            assert.equal(related.args.relatedField, "company");
            assert.equal(related.args.relatedId, company.id);
            const comparison = await request({
                operation: "compare",
                query: "coffee",
                serverUrl: [first, second],
            });
            const compared: Reply<Listing> = comparison._getJSONData();
            assert.equal(comparison.statusCode, 200);
            assert.equal(compared.results.length, 2);
            compared.results.forEach((entry) => assert.equal(entry.result!.docs[0].name, company.name));
            assert(calls.slice(-2).every((call) => call.name === "search_entities" && call.args.entity === "products"));
        }, calls);
        return true;
    },
    publicMarketplaceDiscovery: async () => {
        const calls: ToolCall[] = [];
        await withPublicBackend(async () => {
            const backend = await request({ operation: "backend" });
            assert.equal(backend.statusCode, 200);
            assert.equal(backend._getJSONData().results[0].result.name, "fixture-market");
            const schema = await request({ operation: "schema", entity: "companies", serverUrl: second });
            assert.equal(schema.statusCode, 200);
            assert.equal(schema._getJSONData().results[0].result.fields.name.required, true);
            const discovery = await request({ operation: "servers" });
            assert.equal(discovery.statusCode, 200);
            const result: { servers: string[]; failed: Array<{ serverUrl: string }>; truncated: boolean } =
                discovery._getJSONData().results[0].result;
            assert.deepEqual(result.servers, [first, second]);
            assert.equal(result.failed[0].serverUrl, offline);
            assert.equal(result.truncated, false);
            assert.equal(calls.filter((call) => call.name === "list_syndicated_servers").length, 2);
        }, calls);
        return true;
    },
    publicMarketplaceIsolation: async () => {
        const calls: ToolCall[] = [];
        await withPublicBackend(async () => {
            const invalid: NextApiRequest["query"][] = [
                { operation: "create_entity", entity: "companies" },
                { operation: "list", entity: "orders" },
                { operation: "get", entity: "users", id: "private" },
                {
                    operation: "related",
                    entity: "companies",
                    relatedEntity: "reports",
                    relatedField: "company",
                    relatedId: "private",
                },
                { operation: "list", entity: "companies", serverUrl: "https://127.0.0.1" },
                { operation: "list", entity: "companies", where: "not json" },
                { operation: "list", entity: "companies", where: "[]" },
                { operation: "list", entity: "companies", limit: "101" },
                { operation: "list", entity: "companies", serverUrl: Array.from({ length: 9 }, () => first) },
                { operation: "servers", serverUrl: [first, second] },
            ];
            await Promise.all(invalid.map(async (query) => assert.equal((await request(query)).statusCode, 400)));
            assert.equal((await request({ operation: "list", entity: "companies" }, "POST")).statusCode, 405);
            assert.equal(calls.length, 0);
            const partial = await request({
                operation: "list",
                entity: "companies",
                serverUrl: [first, offline],
            });
            assert.equal(partial.statusCode, 200);
            const body: Reply<Listing> = partial._getJSONData();
            assert.equal(body.results[0].result!.docs[0].id, company.id);
            assert(body.results[1].error);
            const failed = await request({ operation: "list", entity: "companies", serverUrl: offline });
            assert.equal(failed.statusCode, 502);
            assert(failed._getJSONData().results[0].error);
        }, calls);
        return true;
    },
    publicMarketplaceHttp: async () => {
        const readHttp = fetch;
        const calls: ToolCall[] = [];
        await withPublicBackend(
            async () =>
                withHttpFixture(
                    async (req, res) => {
                        const url = new URL(req.url!, "http://localhost");
                        const { default: handler } = await import("../../src/pages/api/marketplace/[operation]");
                        await apiResolver(
                            req,
                            res,
                            {
                                ...Object.fromEntries(url.searchParams),
                                operation: url.pathname.split("/").at(-1),
                            },
                            handler,
                            {
                                dev: true,
                                previewModeId: "fixture",
                                previewModeEncryptionKey: "fixture",
                                previewModeSigningKey: "fixture",
                            },
                            false,
                        );
                    },
                    async (origin) => {
                        const response = await readHttp(`${origin}/api/marketplace/list?entity=companies&limit=5`);
                        assert.equal(response.status, 200);
                        assert.match(response.headers.get("content-type")!, /application\/json/);
                        assert.equal(response.headers.get("cache-control"), "no-store");
                        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
                        const body: Reply<Listing> = await response.json();
                        assert.equal(body.results[0].result!.docs[0].name, company.name);
                        assert(body.links.next);
                    },
                ),
            calls,
        );
        return true;
    },
};
