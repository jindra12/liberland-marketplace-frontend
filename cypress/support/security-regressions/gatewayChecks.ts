import assert from "node:assert/strict";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
import { mock } from "node:test";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { addSyndicatedServer, removeSyndicatedServer } from "../../../src/mcp/session";
import { checkRequestLimit, checkSearchQuota } from "../../../src/server/security/rateLimits";
import {
    GLOBAL_REQUESTS_PER_MINUTE,
    GLOBAL_RAG_SEARCHES_PER_HOUR,
    CLIENT_RAG_SEARCHES_PER_HOUR,
} from "../../../src/server/security/constants";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { publicBackendFetch } from "../../../src/server/security/utils";
import { withBackend } from "../publicDiscoveryChecks";
import { withDiscoveryConfig } from "../agentReadinessChecks";

export const gatewayRegressionChecks = {
    gatewaySearchRejectionPreservesBudgets: async () => {
        // Capture actual library buckets to release this fixture's global allocation afterward.
        const buckets = new Set<RateLimiterMemory>();
        const consume = RateLimiterMemory.prototype.consume;
        const capture = mock.method(
            RateLimiterMemory.prototype,
            "consume",
            async function (this: RateLimiterMemory, key: string, points: number) {
                buckets.add(this);
                return consume.call(this, key, points);
            },
        );
        try {
            const results = await Promise.all(
                Array.from({ length: GLOBAL_RAG_SEARCHES_PER_HOUR / CLIENT_RAG_SEARCHES_PER_HOUR }, (_, index) =>
                    checkSearchQuota(`quota-fixture-${index}`, CLIENT_RAG_SEARCHES_PER_HOUR),
                ),
            );
            assert(results.every((result) => result === 0));
            assert((await checkSearchQuota("quota-rejected-client", CLIENT_RAG_SEARCHES_PER_HOUR)) > 0);
            const global = await Promise.all(
                Array.from(buckets, async (bucket) => ({ bucket, record: await bucket.get("gateway") })),
            );
            const shared = global.find((entry) => entry.record);
            assert(shared);
            assert.equal(
                shared.record!.consumedPoints,
                GLOBAL_RAG_SEARCHES_PER_HOUR,
                "Rejected work must not increase global usage.",
            );
            await shared.bucket.reward("gateway", CLIENT_RAG_SEARCHES_PER_HOUR);
            assert.equal(
                await checkSearchQuota("quota-rejected-client", CLIENT_RAG_SEARCHES_PER_HOUR),
                0,
                "Global rejection must leave the caller's personal allowance available.",
            );
        } finally {
            capture.mock.restore();
            await Promise.all(Array.from(buckets, (bucket) => bucket.delete("gateway")));
        }
        return true;
    },
    gatewayBindsRagProvenance: async () => {
        const { default: handler } = await import("../../../src/pages/api/syndication/ai/search");
        await withBackend(
            async () => {
                const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                    method: "POST",
                    body: { query: "web development", serverUrls: ["https://responding-market.example"] },
                });
                await handler(req, res);
                assert.equal(res.statusCode, 200);
                const result: { sources: Array<{ serverUrl: string }> } = res._getJSONData();
                assert(
                    result.sources.every((source) => source.serverUrl === "https://responding-market.example"),
                    "A backend must not impersonate another backend in RAG provenance.",
                );
            },
            async () =>
                Response.json({
                    answer: "Fixture answer",
                    sources: [
                        {
                            collection: "companies",
                            id: "company",
                            title: "Fixture company",
                            slug: null,
                            serverUrl: "https://impersonated-market.example",
                        },
                    ],
                }),
        );
        return true;
    },
    gatewayBacksOffFailedPoppyDiscovery: async () => {
        await withDiscoveryConfig(async () => {
            const { fetchPoppyDiscovery } = await import("../../../src/server/agentDiscovery/poppy/utils");
            const backend = mock.fn(async () => Response.json({ error: "offline" }, { status: 503 }));
            await withBackend(async () => {
                await assert.rejects(fetchPoppyDiscovery(), /rejected Poppy discovery/);
                await assert.rejects(fetchPoppyDiscovery(), /rejected Poppy discovery/);
                assert.equal(
                    backend.mock.callCount(),
                    1,
                    "Consecutive discovery failures should share a short negative-cache window.",
                );
            }, backend);
        }, "https://poppy-negative-cache.example");
        return true;
    },
    gatewayRejectsUnverifiedSession: async () => {
        const authorization = "Bearer fabricated-session-credential";
        try {
            await withBackend(
                async () =>
                    assert.rejects(
                        addSyndicatedServer(authorization, "https://market.example", "https://market.example"),
                        /auth|token|session/i,
                    ),
                async () => Response.json({ error: "invalid_token" }, { status: 401 }),
            );
        } finally {
            removeSyndicatedServer(authorization, "https://market.example");
        }
        return true;
    },
    gatewayDoesNotDisclosePrivateDns: async () => {
        const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "10.42.7.9", family: 4 }]);
        syncBuiltinESMExports();
        try {
            await assert.rejects(publicBackendFetch("https://private-dns.example/api/graphql"), (error: Error) => {
                assert.doesNotMatch(error.message, /10\.42\.7\.9|private-dns\.example/);
                return true;
            });
        } finally {
            lookup.mock.restore();
            syncBuiltinESMExports();
        }
        return true;
    },
    gatewayRejectedTrafficDoesNotStarveOtherClients: async () => {
        // Run last: deliberately fill only in-memory test-process buckets, never a live service.
        await Promise.all(
            Array.from({ length: GLOBAL_REQUESTS_PER_MINUTE }, () => checkRequestLimit("abusive-test-client")),
        );
        assert.equal(
            await checkRequestLimit("unrelated-test-client"),
            0,
            "Already rejected client requests must not consume everyone else's budget.",
        );
        return true;
    },
};
