const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@liberland/marketplace-contracts"],
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("REACT_APP_"))),
    async rewrites() {
        return [{ source: "/LLM.txt", destination: "/api/guide" }, {
            source: "/.well-known/oauth-protected-resource/api/mcp",
            destination: "/api/oauth-protected-resource",
        }, {
            source: "/.well-known/oauth-protected-resource",
            destination: "/api/poppy-resource",
        }, { source: "/.well-known/:path*", destination: "/api/agent-discovery/:path*" },
        ...["robots.txt", "openapi.json", "auth.md", "auth.txt"].map((path) => ({ source: `/${path}`, destination: `/api/agent-discovery/${path}` })),
        { source: "/api/mcp/server-card", destination: "/api/agent-discovery/mcp/server-card.json" }];
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.md$/i,
            type: "asset/source",
        });

        return config;
    },
};

module.exports = nextConfig;
