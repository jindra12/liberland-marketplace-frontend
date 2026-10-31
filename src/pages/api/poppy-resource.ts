/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import legacyMetadata from "./oauth-protected-resource";
import { fetchPoppyDomainMetadata } from "../../server/agentDiscovery/poppy/utils";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    // Older challenges used this root location with an explicit backend selector.
    if (request.query.serverUrl) {
        legacyMetadata(request, response);
        return;
    }
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "MCP-Protocol-Version");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD, OPTIONS");
        response.status(405).json({ error: "Use GET or HEAD for resource metadata." });
        return;
    }
    try {
        const body = JSON.stringify(await fetchPoppyDomainMetadata());
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Content-Length", Buffer.byteLength(body));
        if (request.method === "HEAD") {
            response.status(200).end();
            return;
        }
        response.status(200).send(body);
    } catch (error) {
        console.error("Poppy domain discovery failed", error);
        response.status(502).json({ error: "The backend has not confirmed this site's Poppy issuer and domain." });
    }
};

export default handler;
