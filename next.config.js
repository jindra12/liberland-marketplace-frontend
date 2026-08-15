const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("REACT_APP_"))),
    async rewrites() {
        return [{
            source: "/.well-known/oauth-protected-resource",
            destination: "/api/oauth-protected-resource",
        }];
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
