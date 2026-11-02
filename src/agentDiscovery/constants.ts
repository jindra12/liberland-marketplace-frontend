export const MCP_IDENTITY = { name: "io.nswap/marketplace", version: "1.0.0" };

export const AGENT_DISCOVERY_LINKS = [
    { href: "/.well-known/api-catalog", rel: "api-catalog", type: "application/linkset+json" },
    { href: "/.well-known/ard.json", rel: "ard", type: "application/json" },
    { href: "/.well-known/ai-catalog.json", rel: "ai-catalog", type: "application/json" },
    { href: "/.well-known/mcp/server-card.json", rel: "mcp-server-card", type: "application/json" },
    { href: "/auth.txt", rel: "help", type: "text/plain" },
];

export const ROBOTS_DISALLOW_PATHS = [
    "/auth/callback",
    "/cart",
    "/order",
    "/profile",
    "/publish",
    "/jobs/edit/",
    "/companies/edit/",
    "/products-services/edit/",
    "/ventures/edit/",
    "/404",
];
