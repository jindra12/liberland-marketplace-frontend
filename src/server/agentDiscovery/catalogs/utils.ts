import { SUPPORTED_PROTOCOL_VERSIONS } from "@modelcontextprotocol/sdk/types.js";
import { buildSiteUrl, SITE_URL } from "../../../siteUrl";
import { MCP_IDENTITY, ROBOTS_DISALLOW_PATHS } from "../../../agentDiscovery/constants";
import { buildProtectedResourceMetadata } from "../../../mcp/auth";
import { getDiscoveryBackend } from "../auth/utils";
import { buildSkillsIndex } from "../skills/utils";

export const buildMcpServerCard = () => ({
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    ...MCP_IDENTITY,
    title: "Nswap syndicated marketplace",
    description: "Search syndicated marketplaces and shop with backend-specific user authorization.",
    websiteUrl: buildSiteUrl("/LLM.txt"),
    remotes: [
        {
            type: "streamable-http",
            url: buildSiteUrl("/api/mcp"),
            supportedProtocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
        },
    ],
    _meta: {
        "io.nswap/auth": {
            guide: buildSiteUrl("/auth.txt"),
            authenticatedResource: buildProtectedResourceMetadata(getDiscoveryBackend()).resource,
            description:
                "Public reads are anonymous. Each selected syndicated backend independently authorizes writes and private data.",
        },
    },
});

export const buildApiCatalog = () => ({
    linkset: [
        {
            anchor: SITE_URL,
            "service-desc": [{ href: buildSiteUrl("/openapi.json"), type: "application/vnd.oai.openapi+json" }],
            "service-doc": [
                { href: buildSiteUrl("/LLM.txt"), type: "text/plain" },
                { href: buildSiteUrl("/auth.txt"), type: "text/plain" },
            ],
            item: [
                { href: buildSiteUrl("/api/search/tribe"), title: "Public affiliation and service search" },
                {
                    href: buildSiteUrl("/api/syndication/ai/search"),
                    title: "Public semantic search over specified backends",
                },
                { href: buildSiteUrl("/api/mcp"), title: "Syndicated MCP gateway" },
                {
                    href: buildSiteUrl("/.well-known/mcp/server-card.json"),
                    type: "application/json",
                    title: "MCP connection metadata",
                },
                {
                    href: buildSiteUrl("/.well-known/agent-card.json"),
                    type: "application/json",
                    title: "Read-only A2A search",
                },
            ],
        },
    ],
});

export const buildAiCatalog = () => ({
    specVersion: "1.0",
    host: { displayName: "Nswap syndicated marketplaces", documentationUrl: buildSiteUrl("/LLM.txt") },
    entries: [
        {
            identifier: "urn:air:nswap:http:search",
            displayName: "Public HTTP and semantic search",
            type: "application/vnd.oai.openapi+json",
            url: buildSiteUrl("/openapi.json"),
            description: "Unauthenticated tribe/service lookup and semantic RAG with explicit backend provenance, pagination and error semantics.",
        },
        {
            identifier: "urn:air:nswap:mcp:marketplace",
            displayName: "Nswap marketplace MCP",
            type: "application/mcp-server-card+json",
            url: buildSiteUrl("/.well-known/mcp/server-card.json"),
            description:
                "Federated marketplace discovery, schema-aware CRUD, carts, orders and checkout with per-backend authorization.",
            representativeQueries: [
                "Find a Liberland web development company",
                "Compare products across syndicated backends",
            ],
        },
        {
            identifier: "urn:air:nswap:a2a:search",
            displayName: "Nswap read-only marketplace search",
            type: "application/a2a-agent-card+json",
            url: buildSiteUrl("/.well-known/agent-card.json"),
            description: "Structured, public tribe and service search without an account or AI credits.",
        },
        ...buildSkillsIndex().skills.map((skill) => ({
            identifier: `urn:air:nswap:skill:${skill.name}`,
            displayName: skill.name,
            type: "application/agent-skills+md",
            url: skill.url,
            description: skill.description,
        })),
    ],
});

export const buildRobotsText = (): string =>
    [
        "User-agent: *",
        "Allow: /",
        "Content-Signal: search=yes, ai-input=yes, ai-train=no",
        ...ROBOTS_DISALLOW_PATHS.map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${buildSiteUrl("/sitemap.xml")}`,
        `Agentmap: ${buildSiteUrl("/.well-known/ard.json")}`,
        "",
        "# Public content only; these preferences grant no access to private data or rights not held by the publisher.",
        `# ${buildSiteUrl("/llms.txt")}`,
        `# ${buildSiteUrl("/LLM.txt")}`,
        `# ${buildSiteUrl("/.well-known/api-catalog")}`,
        "",
    ].join("\n");
