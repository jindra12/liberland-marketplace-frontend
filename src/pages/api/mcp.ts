import type { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getMcpBackendUrl, isMcpAuthenticationRequired, sendMcpAuthorizationChallenge } from "../../mcp/auth";
import { createNswapMcpServer } from "../../mcp/server";
import { MAX_REQUEST_BYTES, REQUEST_TIMEOUT_MS } from "../../server/security/constants";
import { acquireRequestSlot } from "../../server/security/limits";

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
    if (request.method !== "POST" && request.method !== "GET" && request.method !== "DELETE") {
        response.setHeader("Allow", "GET, POST, DELETE");
        response.status(405).json({ error: "Method not allowed." });
        return;
    }

    const authorization = typeof request.headers.authorization === "string" ? request.headers.authorization : undefined;

    let backendUrl: string | null;
    try {
        backendUrl = getMcpBackendUrl(request);
    } catch (error) {
        response.status(400).json({ error: error instanceof Error ? error.message : "Invalid backend URL." });
        return;
    }
    if (isMcpAuthenticationRequired(request) && !authorization) {
        sendMcpAuthorizationChallenge(response, backendUrl);
        return;
    }

    const release = await acquireRequestSlot();
    if (!release) {
        response.setHeader("Retry-After", "5");
        response.status(429).json({ error: "Too many active MCP requests. Please retry shortly." });
        return;
    }
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
    const selectedServerUrl = isMcpAuthenticationRequired(request) ? backendUrl : undefined;
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
        maxRequestBodySize: MAX_REQUEST_BYTES,
    });
    const server = createNswapMcpServer(authorization, selectedServerUrl, signal);

    const onTimeout = () => {
        if (!response.writableEnded) {
            response.status(408).end();
        }
        request.destroy();
    };
    signal.addEventListener("abort", onTimeout, { once: true });

    response.once("close", async () => {
        release();
        signal.removeEventListener("abort", onTimeout);
        controller.abort();
        try {
            await server.close();
        } catch (error) {
            console.error(error);
        }
    });
    try {
        await server.connect(transport);
        await transport.handleRequest(request, response, request.body);
    } catch (error) {
        release();
        console.error(error);
        if (!response.headersSent) {
            response.status(500).json({ error: "MCP request failed." });
        } else {
            response.end();
        }
    }
};

export const config = { api: { bodyParser: false } };

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
