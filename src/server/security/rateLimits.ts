import { createHash } from "node:crypto";
import type { ClientAddressRequest } from "../types";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
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

const consumeBudget = async (limiter: RateLimiterMemory, key: string, points = 1): Promise<number> => {
    try {
        await limiter.consume(key, points);
        return 0;
    } catch (error) {
        if (error instanceof RateLimiterRes) {
            return Math.max(1, Math.ceil(error.msBeforeNext / 1000));
        }
        throw error;
    }
};

export const getClientRateLimitKey = (request: ClientAddressRequest): string => {
    // Forwarded headers are trusted only when Vercel controls the ingress.
    const vercelAddress = process.env.VERCEL === "1" ? request.headers["x-vercel-forwarded-for"] : undefined;
    const address = typeof vercelAddress === "string" ? vercelAddress : request.socket.remoteAddress;
    return createHash("sha256").update(address || "unidentified-client").digest("hex");
};

export const checkRequestLimit = async (clientKey: string): Promise<number> => {
    const globalWait = await consumeBudget(globalRequests, "gateway");
    return globalWait || await consumeBudget(clientRequests, clientKey);
};

export const checkSearchQuota = async (clientKey: string, backendCount: number): Promise<number> => {
    const clientWait = await consumeBudget(clientSearches, clientKey, backendCount);
    return clientWait || await consumeBudget(globalSearches, "gateway", backendCount);
};
