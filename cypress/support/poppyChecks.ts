import assert from "node:assert/strict";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { withBackend } from "./publicDiscoveryChecks";
import { withDiscoveryConfig } from "./agentReadinessChecks";

const checkDiscovery = async (
    backend: string,
    options: { foreignDomain?: boolean; unconfirmed?: boolean; unavailable?: boolean } = {},
) => {
    return withDiscoveryConfig(async () => {
        const { SITE_URL } = await import("../../src/siteUrl");
        const { default: documentHandler } = await import("../../src/pages/api/agent-discovery/[...path]");
        const { default: resourceHandler } = await import("../../src/pages/api/poppy-resource");
        await withBackend(
            async () => {
                const request = createMocks<NextApiRequest, NextApiResponse>({
                    method: "GET",
                    query: { path: ["poppy.json"] },
                });
                await documentHandler(request.req, request.res);
                const root = createMocks<NextApiRequest, NextApiResponse>({ method: "GET" });
                await resourceHandler(root.req, root.res);
                if (options.foreignDomain || options.unconfirmed || options.unavailable) {
                    assert.equal(request.res.statusCode, 502);
                    assert.equal(root.res.statusCode, 502);
                    assert(
                        !request.res._getData().includes('"web":{}'),
                        "Never hide failed account discovery behind a website-only fallback",
                    );
                    return;
                }
                assert.equal(request.res.statusCode, 200);
                const document = JSON.parse(request.res._getData());
                assert.equal(document.organization.domain, new URL(SITE_URL).hostname);
                assert.equal(document.auth.issuer, backend);
                assert.equal(document.apis[0].url, `${backend}/mcp`);
                assert.equal(root.res.statusCode, 200);
                const metadata = JSON.parse(root.res._getData());
                assert.equal(metadata.resource, new URL(SITE_URL).origin);
                assert.deepEqual(metadata.authorization_servers, [backend]);
                assert(metadata.scopes_supported.includes("account:read"));
                const legacy = createMocks<NextApiRequest, NextApiResponse>({
                    method: "GET",
                    query: { serverUrl: backend },
                });
                await resourceHandler(legacy.req, legacy.res);
                assert(JSON.parse(legacy.res._getData()).resource.includes("/api/mcp?auth=required&serverUrl="));
            },
            async (input, init) => {
                const request = new Request(input, init);
                const url = new URL(request.url);
                assert.equal(request.headers.get("Authorization"), null);
                if (options.unavailable) {
                    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
                }
                if (url.pathname === "/.well-known/poppy.json") {
                    assert.equal(url.searchParams.get("domain"), new URL(SITE_URL).hostname);
                    return Response.json({
                        protocol_version: "0.3",
                        organization: {
                            name: "Nswap Marketplace",
                            domain: options.foreignDomain ? "attacker.example" : new URL(SITE_URL).hostname,
                        },
                        auth: { issuer: backend, scopes: { "account:read": "Read your account" } },
                        apis: [{ type: "mcp", url: `${backend}/mcp`, description: "Scoped marketplace MCP" }],
                    });
                }
                assert.equal(url.href, `${backend}/.well-known/oauth-authorization-server`);
                return Response.json({
                    issuer: backend,
                    token_endpoint: `${backend}/api/auth/oauth2/token`,
                    revocation_endpoint: `${backend}/oauth/revoke`,
                    authorization_endpoint: `${backend}/api/auth/oauth2/authorize`,
                    grant_types_supported: ["authorization_code", "refresh_token"],
                    scopes_supported: ["account:read"],
                    protected_resources: options.unconfirmed ? [backend] : [backend, new URL(SITE_URL).origin],
                });
            },
        );
    }, backend);
};

export const poppyChecks = {
    poppyVerifiedDiscovery: () => checkDiscovery("https://poppy-valid.example"),
    poppyForeignDomain: () => checkDiscovery("https://poppy-foreign.example", { foreignDomain: true }),
    poppyUnconfirmedIssuer: () => checkDiscovery("https://poppy-unconfirmed.example", { unconfirmed: true }),
    poppyUnavailableBackend: () => checkDiscovery("https://poppy-offline.example", { unavailable: true }),
};
