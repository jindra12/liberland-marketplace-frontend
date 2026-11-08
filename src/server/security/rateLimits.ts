import { createHash } from "node:crypto";
import type { ClientAddressRequest } from "../types";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { Mutex } from "async-mutex";
import ipaddr from "ipaddr.js";
import {
    CLIENT_RAG_SEARCHES_PER_HOUR,
    CLIENT_REQUESTS_PER_MINUTE,
    GLOBAL_RAG_SEARCHES_PER_HOUR,
    GLOBAL_REQUESTS_PER_MINUTE,
} from "./constants";

const globalRequests = new RateLimiterMemory({ points: GLOBAL_REQUESTS_PER_MINUTE, duration: 60 });
const clientRequests = new RateLimiterMemory({ points: CLIENT_REQUESTS_PER_MINUTE, duration: 60 });
const clientSearches = new RateLimiterMemory({ points: CLIENT_RAG_SEARCHES_PER_HOUR, duration: 3600 });
const globalSearches = new RateLimiterMemory({ points: GLOBAL_RAG_SEARCHES_PER_HOUR, duration: 3600 });

const budgetLock = new Mutex();

const consumeBudgets = (client: RateLimiterMemory, shared: RateLimiterMemory, clientKey: string, points: number) =>
    budgetLock.runExclusive(async () => {
        const budgets = [
            { limiter: client, key: clientKey },
            { limiter: shared, key: "gateway" },
        ];
        const waits = await Promise.all(
            budgets.map(async ({ limiter, key }) => {
                const record = await limiter.get(key);
                return record && record.msBeforeNext > 0 && record.remainingPoints < points
                    ? Math.max(1, Math.ceil(record.msBeforeNext / 1000))
                    : 0;
            }),
        );
        const retryAfter = Math.max(...waits);
        if (retryAfter) {
            return retryAfter;
        }
        // Check both buckets before charging either; concurrent admissions use the same lock.
        await Promise.all(budgets.map(({ limiter, key }) => limiter.consume(key, points)));
        return 0;
    });

export const getClientRateLimitKey = (request: ClientAddressRequest): string => {
    // Forwarded headers are trusted only when Vercel controls the ingress.
    const vercelAddress = process.env.VERCEL === "1" ? request.headers["x-vercel-forwarded-for"] : undefined;
    const address = typeof vercelAddress === "string" ? vercelAddress : request.socket.remoteAddress;
    const parsed = address && ipaddr.isValid(address) ? ipaddr.process(address) : undefined;
    const network =
        parsed instanceof ipaddr.IPv6
            ? ipaddr.IPv6.networkAddressFromCIDR(`${parsed.toString()}/64`).toString()
            : parsed?.toString() || "unidentified-client";
    return createHash("sha256").update(network).digest("hex");
};

export const checkRequestLimit = async (clientKey: string): Promise<number> => {
    return consumeBudgets(clientRequests, globalRequests, clientKey, 1);
};

export const checkSearchQuota = async (clientKey: string, backendCount: number): Promise<number> => {
    return consumeBudgets(clientSearches, globalSearches, clientKey, backendCount);
};
