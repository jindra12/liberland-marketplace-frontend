import assert from "node:assert/strict";
import { createServer, type RequestListener } from "node:http";
import { once } from "node:events";
import { setImmediate } from "node:timers/promises";
import { apiResolver } from "next/dist/server/api-utils/node/api-resolver";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type { OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { withBackend } from "../../publicDiscoveryChecks";
import { withDiscoveryConfig } from "../../agentReadinessChecks";
import { registerFixtureSyndications, withGatewayClient } from "../utils";

export const withHttpFixture = async (handler: RequestListener, check: (url: string) => Promise<void>) => {
    const server = createServer(handler);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert(address && typeof address !== "string");
    try {
        await check(`http://127.0.0.1:${address.port}`);
    } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
};

const respondMcp = async (request: Request) => {
    const server = new McpServer({ name: "isolated-backend", version: "1.0.0" });
    server.registerTool("list_shipping_addresses", { inputSchema: {} }, async () => ({
        content: [{ type: "text", text: JSON.stringify({ addresses: [] }) }],
    }));
    server.registerTool(
        "create_entity",
        { inputSchema: { entity: z.string(), data: z.object({ name: z.string() }) } },
        async () => ({
            content: [{ type: "text", text: JSON.stringify({ id: "created-fixture" }) }],
        }),
    );
    server.registerTool("list_entities", { inputSchema: { entity: z.string() } }, async () => ({
        content: [{ type: "text", text: JSON.stringify({ docs: [] }) }],
    }));
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
        return await transport.handleRequest(request);
    } finally {
        await server.close();
    }
};

export const gatewayTransportChecks = {
    gatewayBoundsConcurrentFanout: async () => {
        const { removeSyndicatedServer } = await import("../../../../src/mcp/session");
        const { DISCOVERY_CONCURRENCY, MAX_SERVERS_PER_SESSION } =
            await import("../../../../src/server/security/constants");
        const authorization = "Bearer fanout-test-fixture";
        const peers = Array.from({ length: MAX_SERVERS_PER_SESSION }, (_, index) => `https://fanout-${index}.example`);
        const gate = Promise.withResolvers<void>();
        const started = Promise.withResolvers<void>();
        const active = { current: 0, peak: 0 };
        await registerFixtureSyndications(authorization, peers, peers[0]);
        try {
            await withDiscoveryConfig(async () => {
                await withBackend(
                    async () => {
                        await withGatewayClient(
                            async (client) => {
                                const work = client.callTool({
                                    name: "list_entities",
                                    arguments: { entity: "companies" },
                                });
                                try {
                                    await started.promise;
                                    await setImmediate();
                                    const peak = active.peak;
                                    gate.resolve();
                                    const result = await work;
                                    assert.notEqual(result.isError, true);
                                    assert(
                                        peak <= DISCOVERY_CONCURRENCY,
                                        `One tool opened ${peak} simultaneous backend requests; the configured federation budget is ${DISCOVERY_CONCURRENCY}.`,
                                    );
                                } finally {
                                    gate.resolve();
                                    await work;
                                }
                            },
                            authorization,
                            peers[0],
                        );
                    },
                    async (input, init) => {
                        active.current += 1;
                        active.peak = Math.max(active.peak, active.current);
                        started.resolve();
                        try {
                            await gate.promise;
                            return await respondMcp(new Request(input, init));
                        } finally {
                            active.current -= 1;
                        }
                    },
                );
            }, peers[0]);
        } finally {
            peers.forEach((peer) => removeSyndicatedServer(authorization, peer));
        }
        return true;
    },
    gatewayStreamsHeadersWithoutBuffering: async () => {
        const { publicBackendFetch } = await import("../../../../src/server/security/utils");
        const headersArrived = Promise.withResolvers<void>();
        const endStream = Promise.withResolvers<void>();
        const state: { received: boolean; error?: Error } = { received: false };
        const nativeFetch = globalThis.fetch;
        await withHttpFixture(
            async (_request, response) => {
                response.writeHead(200, { "content-type": "text/event-stream" });
                response.write('event: message\ndata: {"jsonrpc":"2.0"}\n\n');
                await endStream.promise;
                response.end();
            },
            async (origin) => {
                await withBackend(
                    async () => {
                        const controller = new AbortController();
                        const read = async () => {
                            try {
                                const response = await publicBackendFetch("https://stream-fixture.example/events", {
                                    signal: controller.signal,
                                });
                                state.received = true;
                                await response.body?.cancel();
                            } catch (error) {
                                if (!(error instanceof Error) || error.name !== "AbortError") {
                                    state.error = error instanceof Error ? error : new Error(String(error));
                                    headersArrived.resolve();
                                }
                            }
                        };
                        const work = read();
                        try {
                            await headersArrived.promise;
                            await setImmediate();
                            const receivedBeforeClose = state.received;
                            controller.abort();
                            endStream.resolve();
                            await work;
                            if (state.error) {
                                throw state.error;
                            }
                            assert(
                                receivedBeforeClose,
                                "An open on-wire SSE response must expose its headers/body without buffering until peer close.",
                            );
                        } finally {
                            endStream.resolve();
                            await work;
                        }
                    },
                    async (_input, init) => {
                        // This owned loopback fixture needs native HTTP, not the upstream's public-IP dispatcher.
                        const response = await nativeFetch(`${origin}/events`, {
                            headers: init?.headers,
                            signal: init?.signal,
                        });
                        headersArrived.resolve();
                        return response;
                    },
                );
            },
        );
        return true;
    },
    gatewayHttpRefreshesExpiredCredentials: async (emulateChallenge = false) => {
        const { default: handler, config } = await import("../../../../src/pages/api/mcp");
        const nativeFetch = globalThis.fetch;
        const issuer = "https://http-auth-backend.example";
        const state: { tokens: OAuthTokens; refreshes: number } = {
            tokens: { access_token: "expired-token", refresh_token: "fixture-refresh", token_type: "Bearer", issuer },
            refreshes: 0,
        };
        await withHttpFixture(
            async (request, response) => {
                if (emulateChallenge && request.headers.authorization === "Bearer expired-token") {
                    response.writeHead(401, { "WWW-Authenticate": 'Bearer error="invalid_token"' }).end();
                    return;
                }
                const url = new URL(request.url!, "http://localhost");
                await apiResolver(
                    request,
                    response,
                    Object.fromEntries(url.searchParams),
                    { default: handler, config },
                    {
                        previewModeId: "fixture",
                        previewModeEncryptionKey: "a".repeat(64),
                        previewModeSigningKey: "b".repeat(64),
                        dev: true,
                    },
                    false,
                );
            },
            async (origin) => {
                const url = new URL(`/api/mcp?auth=required&serverUrl=${encodeURIComponent(issuer)}`, origin);
                const provider: OAuthClientProvider = {
                    redirectUrl: "http://127.0.0.1/callback",
                    clientMetadata: {
                        redirect_uris: ["http://127.0.0.1/callback"],
                        token_endpoint_auth_method: "none",
                    },
                    clientInformation: () => ({ client_id: "fixture-client", issuer }),
                    tokens: () => state.tokens,
                    saveTokens: (tokens) => {
                        state.tokens = tokens;
                    },
                    redirectToAuthorization: () => {
                        throw new Error("An existing refresh token must not require interactive login.");
                    },
                    saveCodeVerifier: () => undefined,
                    codeVerifier: () => "fixture-verifier",
                    discoveryState: () => ({
                        authorizationServerUrl: issuer,
                        resourceMetadata: { resource: url.toString(), authorization_servers: [issuer] },
                        authorizationServerMetadata: {
                            issuer,
                            authorization_endpoint: `${issuer}/authorize`,
                            token_endpoint: `${issuer}/token`,
                            response_types_supported: ["code"],
                            token_endpoint_auth_methods_supported: ["none"],
                        },
                    }),
                };
                const dispatch: typeof fetch = async (input, init) => {
                    const request = new Request(input, init);
                    const target = new URL(request.url);
                    if (target.origin === origin) {
                        return nativeFetch(input, init);
                    }
                    if (target.pathname === "/token") {
                        state.refreshes += 1;
                        return Response.json({
                            access_token: "renewed-token",
                            refresh_token: "renewed-refresh",
                            token_type: "Bearer",
                        });
                    }
                    if (request.headers.get("authorization") !== "Bearer renewed-token") {
                        return Response.json(
                            { error: "invalid_token" },
                            { status: 401, headers: { "WWW-Authenticate": 'Bearer error="invalid_token"' } },
                        );
                    }
                    return target.pathname === "/api/auth/oauth2/userinfo"
                        ? Response.json({ sub: "fixture-user" })
                        : respondMcp(request);
                };
                await withDiscoveryConfig(async () => {
                    await withBackend(async () => {
                        const client = new Client({ name: "http-security-client", version: "1.0.0" });
                        const transport = new StreamableHTTPClientTransport(url, {
                            fetch: dispatch,
                            authProvider: provider,
                        });
                        try {
                            await client.connect(transport);
                            const result = await client.callTool({
                                name: "list_shipping_addresses",
                                arguments: {},
                            });
                            assert.equal(
                                state.refreshes,
                                1,
                                "A rejected upstream bearer must reach the SDK as HTTP 401 and trigger refresh.",
                            );
                            assert.notEqual(result.isError, true);
                        } finally {
                            await client.close();
                        }
                    }, dispatch);
                }, issuer);
            },
        );
        return true;
    },
    gatewayWritesRemainSourceAuthorized: async () => {
        const issuer = "https://write-owner.example";
        const requests: string[] = [];
        await withDiscoveryConfig(async () => {
            await withBackend(
                async () => {
                    await withGatewayClient(async (client) => {
                        const denied = await client.callTool({
                            name: "create_entity",
                            arguments: { entity: "companies", data: { name: "Fixture" } },
                        });
                        assert.equal(denied.isError, true);
                        assert.equal(requests.length, 0);
                    });
                    await withGatewayClient(
                        async (client) => {
                            const denied = await client.callTool({
                                name: "create_entity",
                                arguments: {
                                    serverUrl: "https://other-writer.example",
                                    entity: "companies",
                                    data: { name: "Fixture" },
                                },
                            });
                            assert.equal(denied.isError, true);
                            assert.equal(requests.length, 0);
                            const allowed = await client.callTool({
                                name: "create_entity",
                                arguments: { serverUrl: issuer, entity: "companies", data: { name: "Fixture" } },
                            });
                            assert.notEqual(allowed.isError, true);
                            assert(requests.length > 0);
                        },
                        "Bearer owner-fixture",
                        issuer,
                    );
                },
                async (input, init) => {
                    const request = new Request(input, init);
                    assert.equal(new URL(request.url).origin, issuer);
                    assert.equal(request.headers.get("authorization"), "Bearer owner-fixture");
                    requests.push(request.url);
                    return respondMcp(request);
                },
            );
        }, issuer);
        return true;
    },
};
