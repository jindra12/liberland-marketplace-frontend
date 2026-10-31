/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { ServerCallContext } from "@a2a-js/sdk/server";
import { createSearchAgentTransport } from "../../server/a2a/utils";
import { acquireRequestSlot } from "../../server/security/limits";
import { checkRequestLimit, getClientRateLimitKey } from "../../server/security/rateLimits";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, A2A-Version, A2A-Extensions");
    response.setHeader("Access-Control-Expose-Headers", "Retry-After");
    if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
    }
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST, OPTIONS");
        response.status(405).json({ error: "Use A2A JSON-RPC SendMessage over POST. Read the agent card first." });
        return;
    }
    const retryAfter = await checkRequestLimit(getClientRateLimitKey(request));
    if (retryAfter) {
        response.setHeader("Retry-After", String(retryAfter));
        response.status(429).json({ error: "Request limit reached." });
        return;
    }
    const release = await acquireRequestSlot();
    if (!release) {
        response.setHeader("Retry-After", "5");
        response.status(503).json({ error: "Search capacity reached." });
        return;
    }
    try {
        const version = request.headers["a2a-version"];
        const result = await createSearchAgentTransport().handle(
            JSON.stringify(request.body),
            new ServerCallContext({
                requestedVersion: typeof version === "string" ? version : "1.0",
            }),
        );
        if (Symbol.asyncIterator in result) {
            response.status(406).json({ error: "Streaming is not advertised. Use SendMessage." });
            return;
        }
        response.status(200).json(result);
    } catch (error) {
        console.error("A2A search failed", error);
        response
            .status(502)
            .json({ error: "The public marketplace search could not complete. No account action was performed." });
    } finally {
        release();
    }
};

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };
export default handler;
