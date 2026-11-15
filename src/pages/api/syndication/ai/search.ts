import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { normalizePublicBackendUrl } from "../../../../server/security/utils";
import { queryBackendRag } from "../../../../server/ragUtils";
import { acquireRequestSlot } from "../../../../server/security/limits";
import { checkRequestLimit, checkSearchQuota, getClientRateLimitKey } from "../../../../server/security/rateLimits";

type ProxyRequest = {
    query: string;
    serverUrls: string[];
    limit?: number;
};

type BackendSource = {
    collection: string;
    id: string;
    title: string;
    slug?: string | null;
    serverUrl: string;
};

type ProxyResult = {
    serverUrl: string;
    answer?: string;
    sources: BackendSource[];
    error?: string;
};

type ProxyResponse = {
    results: ProxyResult[];
    sources: BackendSource[];
};

const MAX_SERVER_COUNT = 8;
const MAX_QUERY_LENGTH = 600;

const proxyRequestSchema = z.object({
    query: z.string().min(1).max(MAX_QUERY_LENGTH),
    serverUrls: z.array(z.string().max(2048)).min(1).max(MAX_SERVER_COUNT),
    limit: z.number().int().positive().max(20).optional(),
});

const queryBackend = async (serverUrl: string, body: ProxyRequest): Promise<ProxyResult> => {
    // Anonymous fan-out must never expose the caller's token to another backend.
    const result = await queryBackendRag(serverUrl, body.query, body.limit);

    return { serverUrl, answer: result.answer, sources: result.sources.map((source) => ({ ...source, serverUrl })) };
};

const handler = async (
    request: NextApiRequest,
    response: NextApiResponse<ProxyResponse | { error: string }>,
): Promise<void> => {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "GET" && request.method !== "POST") {
        response.setHeader("Allow", "GET, POST");
        response.status(405).json({ error: "Method not allowed." });
        return;
    }

    const clientKey = getClientRateLimitKey(request);
    const retryAfter = await checkRequestLimit(clientKey);
    if (retryAfter) {
        response.setHeader("Retry-After", String(retryAfter));
        response.status(429).json({ error: "Search request limit reached. Please retry later." });
        return;
    }
    const release = await acquireRequestSlot();
    if (!release) {
        response.setHeader("Retry-After", "5");
        response.status(429).json({ error: "Too many active search requests. Please retry shortly." });
        return;
    }
    try {
        const input = proxyRequestSchema.parse(
            request.method === "GET"
                ? {
                      query: request.query.query,
                      serverUrls: request.query.serverUrls ? [request.query.serverUrls].flat() : [],
                      limit: request.query.limit === undefined ? undefined : Number(request.query.limit),
                  }
                : request.body,
        );
        const body = { ...input, serverUrls: Array.from(new Set(input.serverUrls.map(normalizePublicBackendUrl))) };
        const quotaRetryAfter = await checkSearchQuota(clientKey, body.serverUrls.length);
        if (quotaRetryAfter) {
            response.setHeader("Retry-After", String(quotaRetryAfter));
            response.status(429).json({ error: "AI search quota reached. Please retry later." });
            return;
        }
        const settledResults = await Promise.allSettled(
            body.serverUrls.map(async (serverUrl) => queryBackend(serverUrl, body)),
        );
        const results = settledResults.map((settledResult, index) => {
            const serverUrl = body.serverUrls[index];

            if (settledResult.status === "fulfilled") {
                return settledResult.value;
            }

            return {
                serverUrl,
                sources: [],
                error: settledResult.reason instanceof Error ? settledResult.reason.message : "Backend unavailable.",
            };
        });
        const sources = Array.from(
            new Map(
                results
                    .flatMap((result) => result.sources)
                    .map((source) => [`${source.serverUrl}:${source.collection}:${source.id}`, source]),
            ).values(),
        );

        response.status(200).json({ results, sources });
    } catch (error) {
        response.status(400).json({ error: error instanceof Error ? error.message : "Invalid AI search request." });
    } finally {
        release();
    }
};

export const config = { api: { bodyParser: { sizeLimit: "32kb" } } };

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
