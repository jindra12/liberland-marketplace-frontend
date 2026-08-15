import type { NextApiRequest, NextApiResponse } from "next";
import { buildSiteUrl } from "../siteUrl";
import { normalizeBackendUrl } from "./backend";

export const getMcpBackendUrl = (request: NextApiRequest): string | null => {
    const value = request.query.serverUrl;
    const serverUrl = Array.isArray(value) ? value[0] : value;

    if (!serverUrl) {
        return null;
    }

    return normalizeBackendUrl(serverUrl);
};

export const sendMcpAuthorizationChallenge = (
    response: NextApiResponse,
    serverUrl: string | null,
): void => {
    if (!serverUrl) {
        response.status(400).json({ error: "MCP requires a serverUrl query parameter for authentication discovery." });
        return;
    }

    const metadataUrl = new URL(buildSiteUrl("/.well-known/oauth-protected-resource"));
    metadataUrl.searchParams.set("serverUrl", serverUrl);
    response.setHeader("WWW-Authenticate", `Bearer resource_metadata="${metadataUrl.toString()}"`);
    response.status(401).json({ error: "Authentication required.", resource_metadata: metadataUrl.toString() });
};

export const buildProtectedResourceMetadata = (serverUrl: string) => ({
    resource: `${buildSiteUrl("/api/mcp")}?serverUrl=${encodeURIComponent(serverUrl)}`,
    authorization_servers: [`${serverUrl}/api/auth`],
    scopes_supported: ["openid", "profile", "email"],
    bearer_methods_supported: ["header"],
});
