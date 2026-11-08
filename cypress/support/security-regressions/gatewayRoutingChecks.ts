import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { setImmediate } from "node:timers/promises";
import { mock } from "node:test";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { withBackend } from "../publicDiscoveryChecks";
import { withDiscoveryConfig } from "../agentReadinessChecks";
import { registerFixtureSyndications, withGatewayClient } from "./utils";

export const gatewayRoutingChecks = {
    gatewayStreamsPreserveRequestCapacity: async () => {
        await withDiscoveryConfig(async () => {
            const { default: handler } = await import("../../../src/pages/api/mcp");
            const { acquireRequestSlot } = await import("../../../src/server/security/limits");
            const { MAX_ACTIVE_REQUESTS } = await import("../../../src/server/security/constants");
            // Isolate gateway policy from the SDK's Node stream adapter.
            const handling = mock.method(
                StreamableHTTPServerTransport.prototype,
                "handleRequest",
                async () => undefined,
            );
            const responses = Array.from({ length: MAX_ACTIVE_REQUESTS }, () =>
                createMocks<NextApiRequest, NextApiResponse>(
                    { method: "GET", url: "/api/mcp", query: {}, headers: { accept: "text/event-stream" } },
                    { eventEmitter: EventEmitter },
                ),
            );
            try {
                await Promise.all(responses.map(async (entry) => handler(entry.req, entry.res)));
                const release = await acquireRequestSlot();
                release?.();
                assert(release, "Idle notification streams must not exhaust all shared JSON request capacity.");
            } finally {
                responses.forEach((entry) => entry.res.emit("close"));
                await setImmediate();
                handling.mock.restore();
            }
        }, "https://stream-market.example");
        return true;
    },
    gatewayRelatedQueriesRetainSource: async () => {
        const { fetchCompanyRelatedMetadata } = await import("../../../src/detailMetadata/companies");
        const destinations: string[] = [];
        await withBackend(
            async () => {
                await fetchCompanyRelatedMetadata(
                    { id: "company", serverURL: "https://injected-source.example" },
                    {},
                    "https://authoritative-source.example",
                );
                assert(destinations.length > 0, "The real related queries must run.");
                assert(
                    destinations.every((url) => url === "https://authoritative-source.example"),
                    "Response fields must not redirect authoritative relationship queries.",
                );
            },
            async (input, init) => {
                destinations.push(new URL(new Request(input, init).url).origin);
                return Response.json({
                    data: { Jobs: { docs: [] }, Posts: { docs: [] }, Products: { docs: [] }, Startups: { docs: [] } },
                });
            },
        );
        return true;
    },
    gatewayRagPreservesHealthyBackends: async () => {
        await withDiscoveryConfig(async () => {
            const { removeSyndicatedServer } = await import("../../../src/mcp/session");
            const authorization = "Bearer partial-rag-fixture";
            const peer = "https://unavailable-rag.example";
            await registerFixtureSyndications(authorization, [peer], "https://healthy-rag.example");
            try {
                await withBackend(
                    async () => {
                        await withGatewayClient(
                            async (client) => {
                                const result = await client.callTool({
                                    name: "search_rag",
                                    arguments: { query: "fixture company" },
                                });
                                assert.notEqual(
                                    result.isError,
                                    true,
                                    "One failed backend must not discard the healthy backend's semantic results.",
                                );
                                assert.match(JSON.stringify(result.content), /Healthy indexed company/);
                            },
                            authorization,
                            "https://healthy-rag.example",
                        );
                    },
                    async (input, init) => {
                        const url = new URL(new Request(input, init).url);
                        return url.origin === peer
                            ? Response.json({ error: "Embedding service unavailable" }, { status: 503 })
                            : Response.json({ answer: "Healthy indexed company", sources: [] });
                    },
                );
            } finally {
                removeSyndicatedServer(authorization, peer);
            }
        }, "https://healthy-rag.example");
        return true;
    },
};
