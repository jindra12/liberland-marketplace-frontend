import type { NextApiRequest, NextApiResponse } from "next";
import { buildProtectedResourceMetadata, getMcpBackendUrl } from "../../mcp/auth";

const handler = (request: NextApiRequest, response: NextApiResponse): void => {
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
        const serverUrl = getMcpBackendUrl(request);
        if (!serverUrl) {
            response.status(400).json({ error: "serverUrl is required." });
            return;
        }
        const body = JSON.stringify(buildProtectedResourceMetadata(serverUrl));
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Content-Length", Buffer.byteLength(body));
        if (request.method === "HEAD") {
            response.status(200).end();
            return;
        }
        response.status(200).send(body);
    } catch (error) {
        response.status(400).json({ error: error instanceof Error ? error.message : "Invalid backend URL." });
    }
};

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
