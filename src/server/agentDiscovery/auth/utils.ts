import { buildSiteUrl } from "../../../siteUrl";
import { normalizePublicBackendUrl } from "../../security/utils";
import { buildProtectedResourceMetadata } from "../../../mcp/auth";

export const getDiscoveryBackend = (serverUrl?: string): string => {
    const configured = serverUrl || process.env.REACT_APP_BACKEND_URL;
    if (!configured) {
        throw new Error("REACT_APP_BACKEND_URL is required.");
    }
    return normalizePublicBackendUrl(configured);
};

export const getIssuerDiscoveryUrl = (
    kind: "oauth-authorization-server" | "openid-configuration",
    serverUrl?: string,
): string => {
    const issuer = new URL(getDiscoveryBackend(serverUrl));
    const issuerPath = issuer.pathname === "/" ? "" : issuer.pathname;
    // RFC 8414 inserts the well-known prefix before an issuer path; OIDC appends it.
    issuer.pathname =
        kind === "oauth-authorization-server"
            ? `/.well-known/${kind}${issuerPath}`
            : `${issuerPath}/.well-known/${kind}`;
    return issuer.href;
};

export const buildAuthGuide = (serverUrl?: string): string => {
    const backend = getDiscoveryBackend(serverUrl);
    const resource = buildProtectedResourceMetadata(backend);
    return [
        "# auth.md - Nswap authentication",
        "",
        "Nswap is a syndicated marketplace gateway, not a central account provider. Public browsing, affiliation search and read-only MCP tools do not require a login.",
        "Writes and private account data require authorization at the specific source backend. Each backend has independent users, permissions, carts and orders.",
        "This guide documents user OAuth and Poppy authorization. It does not implement the separate Auth.md agent-registration protocol or advertise an agent_auth registration endpoint.",
        "",
        `Default backend: ${backend}`,
        `Public MCP: ${buildSiteUrl("/api/mcp")}`,
        `Authenticated MCP for this backend: ${resource.resource}`,
        `Resource metadata: ${buildSiteUrl("/.well-known/oauth-protected-resource/api/mcp")}?serverUrl=${encodeURIComponent(backend)}`,
        `Authorization-server discovery: ${getIssuerDiscoveryUrl("oauth-authorization-server", backend)}`,
        "",
        "## Connect",
        "",
        "Use an OAuth-capable MCP client. Configure the authenticated MCP URL, then ask the client to log in. Follow its browser consent flow with authorization code and PKCE; never paste passwords or bearer tokens into chat.",
        "An unauthenticated request to the authenticated MCP URL returns 401 with WWW-Authenticate pointing to resource metadata. Follow authorization_servers to the selected backend's canonical issuer and endpoints.",
        "The frontend authorization-server and OpenID discovery URLs redirect to the selected backend; the frontend does not pretend to be that issuer. Resource identifiers and token audiences remain the exact backend-qualified MCP URL.",
        "Replace serverUrl with another public HTTPS backend when needed. Register and authorize a separate connection for each backend. Do not reuse an authorization grant across unrelated servers.",
        "",
        "## Codex example",
        "",
        "```bash",
        `npx @openai/codex mcp add nswap --url '${resource.resource}'`,
        "npx @openai/codex mcp login nswap",
        "```",
        "",
        "## Permissions and safety",
        "",
        "Backend access rules authorize each operation. Schema discovery describes fields and permissions; it is not an authorization grant. Anonymous writes must fail.",
        "Refresh and expiry are determined by the issuer. Revoke access or sign out using that backend's supported flow. A failed or expired grant is not permission to retry under another account.",
        "For refreshable access, request offline_access during consent and register the authorization_code and refresh_token grant types. Resource metadata advertises this scope; keep refresh tokens in the MCP client's credential store, never in chat or a browser URL.",
        "Keep tokens, private addresses and order data out of public catalogs and model context. For purchases, return the create_checkout_link URL: the user reviews and submits orders and approves payments with their wallet in the app. The AI must not sign or broadcast wallet transactions. Publishing and deletion require explicit user confirmation.",
        "",
    ].join("\n");
};
