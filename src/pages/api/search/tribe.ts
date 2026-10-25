/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { tribeSearchSchema } from "../../../tribeSearch/utils";
import { fetchTribeSearchMetadata } from "../../../server/tribeSearch/utils";
import { checkRequestLimit, getClientRateLimitKey } from "../../../server/security/rateLimits";
import { acquireRequestSlot } from "../../../server/security/limits";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        response.status(405).json({ error: "Use GET to search by tribe." });
        return;
    }
    const parsed = tribeSearchSchema.safeParse(request.query);
    if (!parsed.success) {
        response.status(400).json({ error: parsed.error.message });
        return;
    }
    const retryAfter = await checkRequestLimit(getClientRateLimitKey(request));
    if (retryAfter) {
        response.setHeader("Retry-After", retryAfter);
        response.status(429).json({ error: "Request limit reached." });
        return;
    }
    const release = await acquireRequestSlot();
    if (!release) {
        response.status(503).json({ error: "Search capacity reached. Retry shortly." });
        return;
    }
    try {
        const metadata = await fetchTribeSearchMetadata(parsed.data);
        response.setHeader("Content-Type", "application/ld+json; charset=utf-8");
        response.setHeader("Link", metadata.extraLinks.map((link) => `<${link.href}>; rel="${link.rel}"`).join(", "));
        response.status(200).send(JSON.stringify(metadata.jsonLd[0]));
    } catch (error) {
        console.error("Tribe search failed", error);
        response.status(422).json({ error: error instanceof Error ? error.message : "Tribe search failed." });
    } finally {
        release();
    }
};

export default handler;
