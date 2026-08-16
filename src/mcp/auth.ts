import type { NextApiRequest, NextApiResponse } from "next";
import { buildSiteUrl } from "../siteUrl";
import { normalizeBackendUrl } from "./backend";

export const getMcpBackendUrl = (request: NextApiRequest): string | null => {
    const value = request.query.serverUrl;
    const serverUrl = Array.isArray(value) ? value[0] : value;
    const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL;

    const resolvedServerUrl = serverUrl ?? configuredBackendUrl;

    if (!resolvedServerUrl) {
        return null;
    }

    return normalizeBackendUrl(resolvedServerUrl);
};

export const isMcpAuthenticationRequired = (request: NextApiRequest): boolean => {
    const value = request.query.auth;
    const authMode = Array.isArray(value) ? value[0] : value;

    return authMode === "required";
};

export const sendMcpAuthorizationChallenge = (
    response: NextApiResponse,
    serverUrl: string | null,
): void => {
    if (!serverUrl) {
        response.status(500).json({ error: "MCP authentication is not configured with a backend URL." });
        return;
    }

    const metadataUrl = new URL(buildSiteUrl("/.well-known/oauth-protected-resource"));
    metadataUrl.searchParams.set("serverUrl", serverUrl);
    response.setHeader("WWW-Authenticate", `Bearer resource_metadata="${metadataUrl.toString()}"`);
    response.status(401).json({ error: "Authentication required.", resource_metadata: metadataUrl.toString() });
};

export const buildProtectedResourceMetadata = (serverUrl: string) => ({
    resource: `${buildSiteUrl("/api/mcp")}?auth=required&serverUrl=${encodeURIComponent(serverUrl)}`,
    authorization_servers: [serverUrl],
    scopes_supported: ["openid", "profile", "email"],
    bearer_methods_supported: ["header"],
});
