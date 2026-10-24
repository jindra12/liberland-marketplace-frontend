import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { checkRequestLimit, checkSearchQuota, getClientRateLimitKey } from "../../src/server/security/rateLimits";
import { CLIENT_RAG_SEARCHES_PER_HOUR, CLIENT_REQUESTS_PER_MINUTE } from "../../src/server/security/constants";

export const securityRateChecks = {
    securityRateLimits: async () => {
        const client = randomUUID();
        const requests = await Promise.all(Array.from({ length: CLIENT_REQUESTS_PER_MINUTE }, () => checkRequestLimit(client)));
        assert(requests.every((retryAfter) => retryAfter === 0));
        assert(await checkRequestLimit(client) > 0);
        assert.equal(await checkRequestLimit(randomUUID()), 0);

        const searchClient = randomUUID();
        assert.equal(await checkSearchQuota(searchClient, CLIENT_RAG_SEARCHES_PER_HOUR - 1), 0);
        assert.equal(await checkSearchQuota(searchClient, 1), 0);
        assert(await checkSearchQuota(searchClient, 1) > 0);
        assert.equal(await checkSearchQuota(randomUUID(), 1), 0);
        return true;
    },
    securityClientAddress: () => {
        const previousVercel = process.env.VERCEL;
        const request = {
            headers: { "x-vercel-forwarded-for": "198.51.100.10" },
            socket: { remoteAddress: "192.0.2.10" },
        };
        try {
            process.env.VERCEL = "0";
            assert.equal(getClientRateLimitKey(request), getClientRateLimitKey({ ...request, headers: {} }));
            process.env.VERCEL = "1";
            assert.notEqual(getClientRateLimitKey(request), getClientRateLimitKey({ ...request, headers: {} }));
            assert.equal(getClientRateLimitKey(request).length, 64);
        } finally {
            if (previousVercel === undefined) {
                delete process.env.VERCEL;
            } else {
                process.env.VERCEL = previousVercel;
            }
        }
        return true;
    },
};
