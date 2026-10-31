import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type { OAuthClientInformationMixed, OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import { withBackend } from "./publicDiscoveryChecks";
import fixture from "../fixtures/publicDiscovery.json";

const createOAuthHarness = async (backend: string) => {
    const { buildProtectedResourceMetadata } = await import("../../src/mcp/auth");
    const clients = new Map<string, OAuthClientInformationMixed>();
    const tokens = new Map<string, OAuthTokens>();
    const verifiers = new Map<string, string>();
    const redirects: URL[] = [];
    const tokenRequests: URLSearchParams[] = [];
    const metadata = buildProtectedResourceMetadata(backend);
    const provider: OAuthClientProvider = {
        redirectUrl: "http://127.0.0.1:45123/callback",
        clientMetadata: {
            redirect_uris: ["http://127.0.0.1:45123/callback"],
            token_endpoint_auth_method: "none",
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
        },
        state: () => "test-state-not-a-user-secret",
        clientInformation: () => clients.get("current"),
        saveClientInformation: (value) => {
            clients.set("current", value);
        },
        tokens: () => tokens.get("current"),
        saveTokens: (value) => {
            tokens.set("current", value);
        },
        redirectToAuthorization: (url) => {
            redirects.push(url);
        },
        saveCodeVerifier: (value) => {
            verifiers.set("current", value);
        },
        codeVerifier: () => verifiers.get("current")!,
    };
    const fetchFn: typeof fetch = async (input, init) => {
        const request = new Request(input, init);
        const url = new URL(request.url);
        if (url.pathname.startsWith("/.well-known/oauth-protected-resource")) {
            return Response.json(metadata);
        }
        if (url.href === `${backend}/.well-known/oauth-authorization-server`) {
            return Response.json({
                issuer: backend,
                authorization_endpoint: `${backend}/authorize`,
                token_endpoint: `${backend}/token`,
                registration_endpoint: `${backend}/register`,
                response_types_supported: ["code"],
                grant_types_supported: ["authorization_code", "refresh_token"],
                scopes_supported: metadata.scopes_supported,
                code_challenge_methods_supported: ["S256"],
                token_endpoint_auth_methods_supported: ["none"],
            });
        }
        if (url.href === `${backend}/register`) {
            const registration: OAuthClientProvider["clientMetadata"] = await request.json();
            assert(registration.scope?.split(" ").includes("offline_access"));
            return Response.json({ ...registration, client_id: "test-public-client" }, { status: 201 });
        }
        if (url.href === `${backend}/token`) {
            const params = new URLSearchParams(await request.text());
            tokenRequests.push(params);
            assert.equal(params.get("resource"), metadata.resource);
            assert.equal(params.get("client_id"), "test-public-client");
            assert.equal(request.headers.get("authorization"), null);
            switch (params.get("grant_type")) {
                case "authorization_code": {
                    assert.equal(params.get("code"), "consented-test-code");
                    const challenge = createHash("sha256").update(params.get("code_verifier")!).digest("base64url");
                    assert.equal(challenge, redirects[0].searchParams.get("code_challenge"));
                    return Response.json({
                        access_token: "test-access",
                        refresh_token: "test-refresh",
                        token_type: "Bearer",
                        expires_in: 60,
                    });
                }
                case "refresh_token":
                    assert.equal(params.get("refresh_token"), "test-refresh");
                    return Response.json({
                        access_token: "test-access-rotated",
                        refresh_token: "test-refresh-rotated",
                        token_type: "Bearer",
                        expires_in: 60,
                    });
                default:
                    throw new Error("Unexpected token grant");
            }
        }
        throw new Error(`Unexpected OAuth destination: ${url.href}`);
    };
    return { provider, fetchFn, metadata, redirects, tokenRequests, tokens, clients };
};

export const agentAuthChecks = {
    agentA2aSdkClient: async () =>
        withBackend(async () => {
            const { ClientFactory, DefaultAgentCardResolver, JsonRpcTransportFactory } =
                await import("@a2a-js/sdk/client");
            const { AgentCard, SendMessageRequest } = await import("@a2a-js/sdk");
            const { ServerCallContext } = await import("@a2a-js/sdk/server");
            const { buildSearchAgentCard, createSearchAgentTransport } = await import("../../src/server/a2a/utils");
            const card = buildSearchAgentCard();
            const base = new URL(card.supportedInterfaces[0].url).origin;
            const fetchImpl: typeof fetch = async (input, init) => {
                const request = new Request(input, init);
                if (new URL(request.url).pathname === "/.well-known/agent-card.json") {
                    return Response.json(AgentCard.toJSON(card));
                }
                assert.equal(request.url, card.supportedInterfaces[0].url);
                assert.equal(request.headers.get("A2A-Version"), "1.0");
                assert.equal(request.headers.get("Authorization"), null);
                const result = await createSearchAgentTransport().handle(
                    await request.text(),
                    new ServerCallContext({ requestedVersion: "1.0" }),
                );
                assert(!(Symbol.asyncIterator in result));
                return Response.json(result);
            };
            const factory = new ClientFactory({
                transports: [new JsonRpcTransportFactory({ fetchImpl })],
                cardResolver: new DefaultAgentCardResolver({ fetchImpl }),
            });
            const client = await factory.createFromUrl(base);
            const result = await client.sendMessage(
                SendMessageRequest.fromJSON({
                    message: {
                        messageId: "sdk-client-search",
                        role: "ROLE_USER",
                        parts: [
                            {
                                data: {
                                    entity: "companies",
                                    tribe: "Liberland",
                                    q: "web development",
                                    serverUrl: fixture.company.serverURL,
                                },
                                mediaType: "application/json",
                            },
                        ],
                    },
                }),
            );
            assert("parts" in result);
            assert.match(JSON.stringify(result), /AlfaPi srl/);
            assert.match(JSON.stringify(result), /affiliationEvidence/);
        }),
    agentOAuthPkceAndRefresh: async () => {
        const harness = await createOAuthHarness("https://issuer.example");
        const options = { serverUrl: harness.metadata.resource, fetchFn: harness.fetchFn };
        assert.equal(await auth(harness.provider, options), "REDIRECT");
        assert.equal(harness.redirects[0].origin, "https://issuer.example");
        assert.equal(harness.redirects[0].searchParams.get("code_challenge_method"), "S256");
        assert.equal(harness.redirects[0].searchParams.get("state"), "test-state-not-a-user-secret");
        assert(harness.redirects[0].searchParams.get("scope")?.split(" ").includes("offline_access"));
        assert.equal(
            await auth(harness.provider, { ...options, authorizationCode: "consented-test-code" }),
            "AUTHORIZED",
        );
        assert.equal(harness.tokens.get("current")?.issuer, "https://issuer.example");
        // A new client instance restores the registered client and tokens, as after a restart.
        assert.equal(await auth({ ...harness.provider }, options), "AUTHORIZED");
        assert.equal(harness.tokens.get("current")?.refresh_token, "test-refresh-rotated");
        assert.equal(harness.tokenRequests.length, 2);
        return true;
    },
    agentOAuthIssuerIsolation: async () => {
        const original = await createOAuthHarness("https://first.example");
        await auth(original.provider, { serverUrl: original.metadata.resource, fetchFn: original.fetchFn });
        await auth(original.provider, {
            serverUrl: original.metadata.resource,
            authorizationCode: "consented-test-code",
            fetchFn: original.fetchFn,
        });
        const other = await createOAuthHarness("https://second.example");
        other.clients.set("current", original.clients.get("current")!);
        other.tokens.set("current", original.tokens.get("current")!);
        assert.equal(
            await auth(other.provider, { serverUrl: other.metadata.resource, fetchFn: other.fetchFn }),
            "REDIRECT",
        );
        assert.equal(other.tokenRequests.length, 0, "Never send a different issuer's refresh token");
        assert.equal(other.clients.get("current")?.issuer, "https://second.example");
        return true;
    },
    agentOAuthBrowserDiscovery: async () => {
        const { default: resourceHandler } = await import("../../src/pages/api/oauth-protected-resource");
        const { default: mcpHandler } = await import("../../src/pages/api/mcp");
        const { default: a2aHandler } = await import("../../src/pages/api/a2a");
        const { default: discoveryHandler } = await import("../../src/pages/api/agent-discovery/[...path]");
        const preflight = createMocks<NextApiRequest, NextApiResponse>({ method: "OPTIONS" });
        await mcpHandler(preflight.req, preflight.res);
        assert.equal(preflight.res.statusCode, 204);
        assert.match(String(preflight.res.getHeader("Access-Control-Allow-Headers")), /Authorization/);
        assert.match(String(preflight.res.getHeader("Access-Control-Expose-Headers")), /WWW-Authenticate/);
        assert.equal(preflight.res.getHeader("Access-Control-Allow-Credentials"), undefined);
        const challenge = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            query: { auth: "required", serverUrl: "https://issuer.example" },
        });
        await mcpHandler(challenge.req, challenge.res);
        assert.equal(challenge.res.statusCode, 401);
        assert.equal(challenge.res.getHeader("Access-Control-Allow-Origin"), "*");
        const metadata = createMocks<NextApiRequest, NextApiResponse>({
            method: "HEAD",
            query: { serverUrl: "https://issuer.example" },
        });
        resourceHandler(metadata.req, metadata.res);
        assert.equal(metadata.res.statusCode, 200);
        assert.equal(metadata.res._getData(), "");
        assert.equal(metadata.res.getHeader("Cache-Control"), "no-store");
        const metadataPreflight = createMocks<NextApiRequest, NextApiResponse>({ method: "OPTIONS" });
        resourceHandler(metadataPreflight.req, metadataPreflight.res);
        assert.equal(metadataPreflight.res.statusCode, 204);
        assert.match(String(metadataPreflight.res.getHeader("Access-Control-Allow-Headers")), /MCP-Protocol-Version/);
        const cardPreflight = createMocks<NextApiRequest, NextApiResponse>({ method: "OPTIONS" });
        await discoveryHandler(cardPreflight.req, cardPreflight.res);
        assert.equal(cardPreflight.res.statusCode, 204);
        assert.match(String(cardPreflight.res.getHeader("Access-Control-Allow-Headers")), /A2A-Version/);
        const a2aPreflight = createMocks<NextApiRequest, NextApiResponse>({ method: "OPTIONS" });
        await a2aHandler(a2aPreflight.req, a2aPreflight.res);
        assert.equal(a2aPreflight.res.statusCode, 204);
        assert.equal(a2aPreflight.res.getHeader("Access-Control-Allow-Origin"), "*");
        const invalid = createMocks<NextApiRequest, NextApiResponse>({ method: "POST" });
        resourceHandler(invalid.req, invalid.res);
        assert.equal(invalid.res.statusCode, 405);
        return true;
    },
};
