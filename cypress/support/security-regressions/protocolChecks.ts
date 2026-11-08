import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { EventEmitter } from "node:events";
import { mock } from "node:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { withBackend } from "../publicDiscoveryChecks";
import { withDiscoveryConfig } from "../agentReadinessChecks";
import { withGatewayClient } from "./utils";

export const protocolRegressionChecks = {
    gatewayChallengesInvalidBearer: async () => {
        const { default: handler } = await import("../../../src/pages/api/mcp");
        // Test the HTTP authentication gate, not Hono's Node stream adapter.
        const handling = mock.method(
            StreamableHTTPServerTransport.prototype,
            "handleRequest",
            async (...args: Parameters<StreamableHTTPServerTransport["handleRequest"]>) => {
                args[1].end();
            },
        );
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>(
            {
                method: "POST",
                url: "/api/mcp?auth=required&serverUrl=https%3A%2F%2Fissuer.example",
                query: { auth: "required", serverUrl: "https://issuer.example" },
                headers: {
                    authorization: "Bearer fabricated-invalid-token",
                    host: "frontend.example",
                    "content-type": "application/json",
                    accept: "application/json, text/event-stream",
                },
                body: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "initialize",
                    params: {
                        protocolVersion: LATEST_PROTOCOL_VERSION,
                        capabilities: {},
                        clientInfo: { name: "security-fixture", version: "1.0.0" },
                    },
                },
            },
            { eventEmitter: EventEmitter },
        );
        try {
            await withBackend(
                async () => handler(req, res),
                async () => Response.json({ error: "invalid_token" }, { status: 401 }),
            );
            assert.equal(
                handling.mock.callCount(),
                0,
                "Unverified credentials must not enter the authenticated MCP transport.",
            );
            assert.equal(
                res.statusCode,
                401,
                `Invalid bearer credentials must trigger the HTTP challenge needed for client refresh. Response: ${String(res._getData())}`,
            );
            assert.match(String(res.getHeader("WWW-Authenticate")), /Bearer/);
        } finally {
            res.emit("close");
            handling.mock.restore();
        }
        return true;
    },
    gatewayDescribeSelectedBackend: async () => {
        await withDiscoveryConfig(async () => {
            const destinations: string[] = [];
            await withBackend(
                async () => {
                    await withGatewayClient(
                        async (client) => {
                            const result = await client.callTool({ name: "describe_backend", arguments: {} });
                            assert.notEqual(result.isError, true);
                            assert(destinations.length > 0, "The backend MCP must actually be contacted.");
                            assert(
                                destinations.every((url) => url === "https://selected-market.example"),
                                "Discovery must describe the backend of the authenticated connection, not the configured default.",
                            );
                        },
                        "Bearer selected-market-token",
                        "https://selected-market.example",
                    );
                },
                async (input, init) => {
                    const request = new Request(input, init);
                    destinations.push(new URL(request.url).origin);
                    const server = new McpServer({ name: "backend-fixture", version: "1.0.0" });
                    server.registerTool("describe_backend", { inputSchema: {} }, async () => ({
                        content: [{ type: "text", text: JSON.stringify({ name: "backend-fixture" }) }],
                    }));
                    const transport = new WebStandardStreamableHTTPServerTransport({
                        sessionIdGenerator: undefined,
                        enableJsonResponse: true,
                    });
                    await server.connect(transport);
                    try {
                        return await transport.handleRequest(request);
                    } finally {
                        await server.close();
                    }
                },
            );
        }, "https://default-market.example");
        return true;
    },
    gatewayOptionalRelationsDoNotHideDetail: async () => {
        const { createDetailPageProps } = await import("../../../src/server/detailPage");
        const { encodeServerUrlSegment } = await import("../../../src/routes");
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
        const props = createDetailPageProps({
            buildVariables: () => ({ id: "company" }),
            fetcher: async () => ({ name: "Existing company" }),
            selectEntity: (data) => data,
            fetchAdditionalData: async () => {
                throw new Error("Related products are temporarily unavailable");
            },
            buildCanonicalPath: () => "/companies/company/source",
            buildMetadata: (entity) => ({
                title: entity.name,
                description: "Fixture description",
                canonicalPath: "/companies/company/source",
                jsonLd: [],
            }),
        });
        const result = await props({
            req,
            res,
            params: { id: "company", serverUrl: encodeServerUrlSegment("https://market.example") },
            query: {},
            resolvedUrl: "/companies/company/source",
        });
        assert("props" in result, "A failed optional relationship query must not turn an existing company into a 404.");
        return true;
    },
    gatewaySitemapPreservesPrimary: async () => {
        await withDiscoveryConfig(async () => {
            const { buildSyndicatedSitemapIndex } = await import("../../../src/server/sitemaps/utils");
            const shards = Array.from({ length: 10000 }, (_, index) => ({
                file: `companies-${index.toString(16).padStart(64, "0")}.xml`,
                lastmod: "2026-01-01T00:00:00.000Z",
                count: 1,
            }));
            await withBackend(
                async () => {
                    await assert.doesNotReject(
                        buildSyndicatedSitemapIndex(),
                        "An oversized federation must not take down the primary sitemap.",
                    );
                },
                async (input, init) => {
                    const url = new URL(new Request(input, init).url);
                    return Response.json({
                        version: 1,
                        generatedAt: "2026-01-01T00:00:00.000Z",
                        serverUrl: url.origin,
                        frontendUrl: "https://frontend.example",
                        syndicatedServers:
                            url.hostname === "primary-sitemap.example"
                                ? Array.from({ length: 5 }, (_, index) => `https://peer-${index}.example`)
                                : [],
                        shards,
                    });
                },
            );
        }, "https://primary-sitemap.example");
        return true;
    },
    gatewayAbortsResponseBody: async () => {
        const { publicBackendFetch } = await import("../../../src/server/security/utils");
        const reading = Promise.withResolvers<void>();
        const release = Promise.withResolvers<void>();
        const controller = new AbortController();
        const state = { cancelled: false };
        const stream = new ReadableStream<Uint8Array>(
            {
                async pull(streamController) {
                    reading.resolve();
                    await release.promise;
                    if (!state.cancelled) {
                        streamController.close();
                    }
                },
                cancel() {
                    state.cancelled = true;
                },
            },
            { highWaterMark: 0 },
        );
        try {
            await withBackend(
                async () => {
                    const result = publicBackendFetch("https://body-stream.example/api/graphql", {
                        signal: controller.signal,
                    });
                    await Promise.race([reading.promise, result]);
                    controller.abort();
                    await setImmediate();
                    const cancelledBeforeCleanup = state.cancelled;
                    release.resolve();
                    try {
                        await result;
                    } catch (error) {
                        if (!(error instanceof Error) || error.name !== "AbortError") {
                            throw error;
                        }
                    }
                    assert(
                        cancelledBeforeCleanup,
                        "Caller cancellation must stop reading a response body after headers arrive.",
                    );
                },
                async () => new Response(stream),
            );
        } finally {
            release.resolve();
        }
        return true;
    },
};
