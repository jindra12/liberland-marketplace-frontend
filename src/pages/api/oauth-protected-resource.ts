import type { NextApiRequest, NextApiResponse } from "next";
import { buildProtectedResourceMetadata, getMcpBackendUrl } from "../../mcp/auth";

const handler = (request: NextApiRequest, response: NextApiResponse): void => {
    try {
        const serverUrl = getMcpBackendUrl(request);
        if (!serverUrl) {
            response.status(400).json({ error: "serverUrl is required." });
            return;
        }
        response.status(200).json(buildProtectedResourceMetadata(serverUrl));
    } catch (error) {
        response.status(400).json({ error: error instanceof Error ? error.message : "Invalid backend URL." });
    }
};

// Next Pages API routes require a default handler export.
// eslint-disable-next-line import/no-default-export
export default handler;
