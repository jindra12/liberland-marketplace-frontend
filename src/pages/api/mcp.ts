import type { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createNswapMcpServer } from "../../mcp/server";

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
    if (request.method !== "POST" && request.method !== "GET" && request.method !== "DELETE") {
        response.setHeader("Allow", "GET, POST, DELETE");
        response.status(405).json({ error: "Method not allowed." });
        return;
    }

    const authorization = typeof request.headers.authorization === "string" ? request.headers.authorization : undefined;

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    const server = createNswapMcpServer(authorization);

    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
};

export const config = { api: { bodyParser: false } };

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
