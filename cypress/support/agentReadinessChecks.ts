import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { AgentCard, SendMessageResponse, TaskState } from "@a2a-js/sdk";
import cardSchema from "../fixtures/agentDiscovery/mcp-server-card.schema.json";
import catalogSchema from "../fixtures/agentDiscovery/ai-catalog.schema.json";
import fixture from "../fixtures/publicDiscovery.json";
import { withBackend } from "./publicDiscoveryChecks";

export const withDiscoveryConfig = async (check: () => Promise<void>, backend = fixture.company.serverURL) => {
    const original = process.env.REACT_APP_BACKEND_URL;
    process.env.REACT_APP_BACKEND_URL = backend;
    try {
        await check();
    } finally {
        if (original === undefined) {
            delete process.env.REACT_APP_BACKEND_URL;
        } else {
            process.env.REACT_APP_BACKEND_URL = original;
        }
    }
    return true;
};

export const agentReadinessChecks = {
    agentReadinessToolCatalog: async () => {
        const [{ Client }, { InMemoryTransport }, { createNswapMcpServer }] = await Promise.all([
            import("@modelcontextprotocol/sdk/client/index.js"),
            import("@modelcontextprotocol/sdk/inMemory.js"),
            import("../../src/mcp/server"),
        ]);
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        const client = new Client({ name: "webmcp-parity-test", version: "1.0.0" });
        const server = createNswapMcpServer(undefined, undefined, "webmcp-parity-test");
        try {
            await server.connect(serverTransport);
            await client.connect(clientTransport);
            return (await client.listTools()).tools;
        } finally {
            await client.close();
            await server.close();
        }
    },
    agentReadinessDocuments: async () =>
        withDiscoveryConfig(async () => {
            const { findDiscoveryDocument } = await import("../../src/server/agentDiscovery/utils");
            const { buildMcpServerCard, buildAiCatalog } =
                await import("../../src/server/agentDiscovery/catalogs/utils");
            const { buildOpenApiDocument } = await import("../../src/server/agentDiscovery/openapi/utils");
            const validator = new Ajv2020({ strict: false });
            addFormats(validator);
            validator.addSchema(cardSchema, "upstream-mcp");
            assert(
                validator.validate({ $ref: "upstream-mcp#/$defs/ServerCard" }, buildMcpServerCard()),
                JSON.stringify(validator.errors),
            );
            assert(validator.validate(catalogSchema, buildAiCatalog()), JSON.stringify(validator.errors));
            const { default: SwaggerParser } = await import("@apidevtools/swagger-parser");
            await SwaggerParser.validate(buildOpenApiDocument());
            [
                "api-catalog",
                "ard.json",
                "ai-catalog.json",
                "mcp/server-card.json",
                "mcp.json",
                "openapi.json",
                "agent-card.json",
                "agent-skills/index.json",
                "auth.md",
                "auth.txt",
                "robots.txt",
            ].forEach((path) => {
                const document = findDiscoveryDocument(path);
                assert(document?.body);
                assert(!document.body.includes("undefined"));
            });
            assert.equal(findDiscoveryDocument("invented.json"), undefined);
            const card = AgentCard.fromJSON(JSON.parse(findDiscoveryDocument("agent-card.json")!.body));
            assert.equal(card.supportedInterfaces[0].protocolVersion, "1.0");
            assert.equal(card.capabilities?.streaming, false);
            const robots = findDiscoveryDocument("robots.txt")!.body;
            assert.match(robots, /Content-Signal: search=yes, ai-input=yes, ai-train=no/);
            ["/profile", "/order", "/cart", "/publish"].forEach((path) => assert(robots.includes(`Disallow: ${path}`)));
            assert.match(robots, /Agentmap: https:\/\/[^\s]+\/\.well-known\/ard.json/);
        }),
    agentReadinessSkills: async () =>
        withDiscoveryConfig(async () => {
            const { buildSkillsIndex } = await import("../../src/server/agentDiscovery/skills/utils");
            const { findDiscoveryDocument } = await import("../../src/server/agentDiscovery/utils");
            const index = buildSkillsIndex();
            assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
            index.skills.forEach((skill) => {
                assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
                assert.equal(skill.type, "skill-md");
                const document = findDiscoveryDocument(new URL(skill.url).pathname.replace("/.well-known/", ""));
                assert(document);
                assert(document.body.startsWith(`---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n`));
                assert.equal(skill.digest, `sha256:${createHash("sha256").update(document.body).digest("hex")}`);
            });
        }),
    agentReadinessHandlers: async () =>
        withDiscoveryConfig(async () => {
            const { default: handler } = await import("../../src/pages/api/agent-discovery/[...path]");
            const { getIssuerDiscoveryUrl } = await import("../../src/server/agentDiscovery/auth/utils");
            assert.equal(
                getIssuerDiscoveryUrl("oauth-authorization-server", "https://another.example/tenant"),
                "https://another.example/.well-known/oauth-authorization-server/tenant",
            );
            assert.equal(
                getIssuerDiscoveryUrl("openid-configuration", "https://another.example/tenant"),
                "https://another.example/tenant/.well-known/openid-configuration",
            );
            const get = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { path: ["api-catalog"] },
            });
            await handler(get.req, get.res);
            assert.equal(get.res.statusCode, 200);
            assert.match(String(get.res.getHeader("Content-Type")), /application\/linkset\+json/);
            const catalog = JSON.parse(get.res._getData()) as { linkset: Array<{ item: Array<{ href: string }> }> };
            assert(catalog.linkset[0].item.some((item) => item.href.endsWith("/api/mcp")));
            const head = createMocks<NextApiRequest, NextApiResponse>({
                method: "HEAD",
                query: { path: ["agent-skills", "index.json"] },
            });
            await handler(head.req, head.res);
            assert.equal(head.res.statusCode, 200);
            assert.equal(head.res._getData(), "");
            const { findDiscoveryDocument } = await import("../../src/server/agentDiscovery/utils");
            assert.equal(
                head.res.getHeader("Content-Length"),
                Buffer.byteLength(findDiscoveryDocument("agent-skills/index.json")!.body),
            );
            const invalid = createMocks<NextApiRequest, NextApiResponse>({
                method: "POST",
                query: { path: ["auth.txt"] },
            });
            await handler(invalid.req, invalid.res);
            assert.equal(invalid.res.statusCode, 405);
            const missing = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { path: ["not-an-endpoint"] },
            });
            await handler(missing.req, missing.res);
            assert.equal(missing.res.statusCode, 404);
            const issuer = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { path: ["oauth-authorization-server"], serverUrl: "https://another.example" },
            });
            await handler(issuer.req, issuer.res);
            assert.equal(issuer.res.statusCode, 302);
            assert.equal(
                issuer.res._getRedirectUrl(),
                "https://another.example/.well-known/oauth-authorization-server",
            );
            const privateSource = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { path: ["oauth-authorization-server"], serverUrl: "https://127.0.0.1" },
            });
            await handler(privateSource.req, privateSource.res);
            assert.equal(privateSource.res.statusCode, 400);
        }),
    agentReadinessAuth: async () =>
        withDiscoveryConfig(async () => {
            const { sendMcpAuthorizationChallenge, buildProtectedResourceMetadata } =
                await import("../../src/mcp/auth");
            const { default: handler } = await import("../../src/pages/api/oauth-protected-resource");
            const challenge = createMocks<NextApiRequest, NextApiResponse>();
            sendMcpAuthorizationChallenge(challenge.res, "https://another.example");
            assert.equal(challenge.res.statusCode, 401);
            assert.match(
                String(challenge.res.getHeader("WWW-Authenticate")),
                /oauth-protected-resource\/api\/mcp\?serverUrl=/,
            );
            const metadata = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { serverUrl: "https://another.example" },
            });
            handler(metadata.req, metadata.res);
            assert.equal(metadata.res.statusCode, 200);
            assert.deepEqual(
                JSON.parse(metadata.res._getData()),
                buildProtectedResourceMetadata("https://another.example"),
            );
            assert.equal(JSON.parse(metadata.res._getData()).authorization_servers[0], "https://another.example");
            assert.match(
                JSON.parse(metadata.res._getData()).resource,
                /auth=required&serverUrl=https%3A%2F%2Fanother.example$/,
            );
        }),
    agentReadinessMarkdown: async () =>
        withDiscoveryConfig(async () => {
            const { jsonLdPageResponse } = await import("../../src/server/jsonLd/utils");
            const { wantsMarkdown } = await import("../../src/server/markdown/utils");
            assert(!wantsMarkdown("*/*"));
            assert(!wantsMarkdown("text/html;q=1, text/markdown;q=0.1"));
            assert(!wantsMarkdown("text/markdown;q=0"));
            assert(wantsMarkdown("text/markdown"));
            const metadata = {
                title: "Liberland companies",
                description: "Affiliation, not incorporation",
                canonicalPath: "/companies?tribeId=tribe&serverUrl=https%3A%2F%2Fbackend.example&page=2",
                jsonLd: [{ "@context": "https://schema.org", name: "AlfaPi" }],
                content: {
                    title: "Liberland companies",
                    description: "Affiliation, not incorporation",
                    items: [
                        {
                            name: fixture.company.name,
                            description: fixture.company.description,
                            url: "/companies/company/source",
                            affiliation: { name: "Liberland", url: "/tribes/tribe/source" },
                        },
                    ],
                    links: [
                        {
                            name: "Next page",
                            url: "/companies?tribeId=tribe&serverUrl=https%3A%2F%2Fbackend.example&page=3",
                        },
                    ],
                },
            };
            const markdown = createMocks<NextApiRequest, NextApiResponse>();
            jsonLdPageResponse(metadata, {}, markdown.res, "text/markdown");
            assert.match(String(markdown.res.getHeader("Content-Type")), /text\/markdown/);
            assert.match(String(markdown.res.getHeader("Vary")), /Accept/);
            assert.equal(markdown.res.getHeader("Cache-Control"), "private, no-store");
            const text = markdown.res._getData();
            assert.match(text, /AlfaPi srl/);
            assert.match(text, /website development/);
            assert.match(text, /Tribe affiliation/);
            const { marked } = await import("marked");
            const links: string[] = [];
            marked.walkTokens(marked.lexer(text), (token) => {
                if (token.type === "link") {
                    links.push(token.href);
                }
            });
            assert(
                links.some(
                    (href) =>
                        new URL(href, "https://nswap.io").searchParams.get("page") === "3" &&
                        new URL(href, "https://nswap.io").searchParams.get("format") === "markdown",
                ),
            );
            assert(!text.includes("<script"));
            const html = createMocks<NextApiRequest, NextApiResponse>();
            jsonLdPageResponse(metadata, {}, html.res, "text/html");
            assert.equal(html.res._getData(), "");
            assert.match(String(html.res.getHeader("Link")), /api-catalog/);
            const json = createMocks<NextApiRequest, NextApiResponse>();
            jsonLdPageResponse(metadata, { format: "jsonld" }, json.res, "text/markdown");
            assert.match(String(json.res.getHeader("Content-Type")), /application\/ld\+json/);
            assert.deepEqual(JSON.parse(json.res._getData())["@graph"], metadata.jsonLd);
        }),
    agentReadinessA2a: async () =>
        withDiscoveryConfig(async () => {
            await withBackend(async () => {
                const { default: handler } = await import("../../src/pages/api/a2a");
                const request = createMocks<NextApiRequest, NextApiResponse>({
                    method: "POST",
                    headers: { authorization: "Bearer must-not-be-forwarded", "a2a-version": "1.0" },
                    body: {
                        jsonrpc: "2.0",
                        id: "read-test",
                        method: "SendMessage",
                        params: {
                            message: {
                                messageId: "query-1",
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
                        },
                    },
                });
                await handler(request.req, request.res);
                assert.equal(request.res.statusCode, 200);
                const body = JSON.parse(request.res._getData()) as { result?: object; error?: object };
                assert(!body.error, JSON.stringify(body));
                const result = SendMessageResponse.fromJSON(body.result);
                assert.equal(result.payload?.$case, "message");
                assert.match(JSON.stringify(result), /AlfaPi srl/);
                assert.match(JSON.stringify(result), /affiliationEvidence/);
                const invalid = createMocks<NextApiRequest, NextApiResponse>({
                    method: "POST",
                    headers: { "a2a-version": "1.0" },
                    body: {
                        jsonrpc: "2.0",
                        id: "malicious",
                        method: "SendMessage",
                        params: {
                            message: {
                                messageId: "x",
                                role: "ROLE_USER",
                                parts: [
                                    { data: { entity: "orders", tribe: "Liberland" }, mediaType: "application/json" },
                                ],
                            },
                        },
                    },
                });
                await handler(invalid.req, invalid.res);
                const rejected = SendMessageResponse.fromJSON(JSON.parse(invalid.res._getData()).result);
                assert.equal(rejected.payload?.$case, "task");
                if (rejected.payload?.$case === "task") {
                    assert.equal(
                        rejected.payload.value.status?.state,
                        TaskState.TASK_STATE_FAILED,
                        "The SDK must report a failed task, not complete a private entity request",
                    );
                }
            });
        }),
};
