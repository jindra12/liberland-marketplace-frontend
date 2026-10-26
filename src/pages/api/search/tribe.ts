/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { tribeSearchSchema } from "../../../tribeSearch/utils";
import { fetchTribeSearchResult } from "../../../server/tribeSearch/utils";
import { buildTribeListingMetadata } from "../../../tribeSearch/utils";
import { buildTribeJsonResponse, tribeSearchFailure } from "../../../server/tribeSearch/results/utils";
import { checkRequestLimit, getClientRateLimitKey } from "../../../server/security/rateLimits";
import { acquireRequestSlot } from "../../../server/security/limits";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ code: "METHOD_NOT_ALLOWED", error: "Use GET to search by tribe." });
        return;
    }
    const parsed = tribeSearchSchema.safeParse(request.query);
    if (!parsed.success) {
        response.status(400).json({ code: "INVALID_REQUEST", error: parsed.error.message });
        return;
    }
    const retryAfter = await checkRequestLimit(getClientRateLimitKey(request));
    if (retryAfter) {
        response.setHeader("Retry-After", retryAfter);
        response.status(429).json({ code: "RATE_LIMITED", error: "Request limit reached." });
        return;
    }
    const release = await acquireRequestSlot();
    if (!release) {
        response.status(503).json({ code: "SEARCH_CAPACITY", error: "Search capacity reached. Retry shortly." });
        return;
    }
    try {
        const result = await fetchTribeSearchResult(parsed.data);
        response.setHeader("Cache-Control", "public, max-age=60, stale-if-error=300");
        if (parsed.data.format === "json") {
            const body = buildTribeJsonResponse(result);
            const links = [
                body.links.next ? `<${body.links.next}>; rel="next"` : "",
                body.links.previous ? `<${body.links.previous}>; rel="prev"` : "",
            ]
                .filter(Boolean)
                .join(", ");
            if (links) {
                response.setHeader("Link", links);
            }
            response.status(200).json(body);
            return;
        }
        const metadata = buildTribeListingMetadata(parsed.data, result.tribe, result.serverUrl, result.listing);
        response.setHeader("Content-Type", "application/ld+json; charset=utf-8");
        response.setHeader("Link", metadata.extraLinks.map((link) => `<${link.href}>; rel="${link.rel}"`).join(", "));
        response.status(200).send(JSON.stringify(metadata.jsonLd[0]));
    } catch (error) {
        console.error("Tribe search failed", error);
        const failure = tribeSearchFailure(error);
        response.setHeader("Cache-Control", "no-store");
        response.status(failure.status).json(failure.body);
    } finally {
        release();
    }
};

export default handler;
