import type { NextApiRequest, NextApiResponse } from "next";
import { executePublicMarketplaceRead, buildPublicMarketplaceResponse } from "../../../server/publicMarketplace/utils";
import { publicMarketplaceSchema } from "../../../server/publicMarketplace/schema";
import { checkRequestLimit, getClientRateLimitKey } from "../../../server/security/rateLimits";
import { acquireRequestSlot } from "../../../server/security/limits";
import { REQUEST_TIMEOUT_MS } from "../../../server/security/constants";

/**
 * Exposes read-only marketplace tools as ordinary GET endpoints for HTTP agents.
 * Next.js maps the final URL segment (e.g. /api/marketplace/list) to operation.
 * Validates query parameters and applies request/concurrency limits, then calls
 * the existing MCP handlers in-process without forwarding caller credentials.
 * Returns decoded JSON results or errors per backend, with source URLs and
 * pagination links. Partial failures retain successful results; all-tool failures
 * return 502. The concurrency slot is released even when execution fails.
 */
const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Use GET for public marketplace reads." });
        return;
    }
    const clientKey = getClientRateLimitKey(request);
    const retryAfter = await checkRequestLimit(clientKey);
    if (retryAfter) {
        response.setHeader("Retry-After", String(retryAfter));
        response.status(429).json({ error: "Marketplace request limit reached." });
        return;
    }
    const parsed = publicMarketplaceSchema.safeParse(request.query);
    if (!parsed.success) {
        response.status(400).json({ error: parsed.error.message });
        return;
    }
    const release = await acquireRequestSlot();
    if (!release) {
        response.setHeader("Retry-After", "5");
        response.status(503).json({ error: "Marketplace read capacity reached. Retry shortly." });
        return;
    }
    try {
        const results = await executePublicMarketplaceRead(
            parsed.data,
            clientKey,
            AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        );
        const failed = results.every((entry) => "error" in entry);
        const body = buildPublicMarketplaceResponse(parsed.data, request.query, results);
        const links = [
            body.links.next ? `<${body.links.next}>; rel="next"` : "",
            body.links.previous ? `<${body.links.previous}>; rel="prev"` : "",
        ]
            .filter(Boolean)
            .join(", ");
        if (links) {
            response.setHeader("Link", links);
        }
        response.status(failed ? 502 : 200).json(body);
    } catch (error) {
        console.error("Public marketplace gateway failed", error);
        response.status(502).json({ error: "Marketplace backend unavailable." });
    } finally {
        release();
    }
};

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
