import { defineConfig } from "cypress";
import { createRequire } from "node:module";
import path from "node:path";

import { clearTestServerPorts, startTestServers, stopTestServers } from "./tests/ct/servers/cypressServers";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.BABEL_ENV = process.env.BABEL_ENV || "development";

const require = createRequire(import.meta.url);
const webpack = require("webpack");
const craWebpackConfigFactory = require("react-scripts/config/webpack.config");
const webpackConfig = craWebpackConfigFactory("development");

webpackConfig.resolve.fallback = {
    ...(webpackConfig.resolve.fallback || {}),
    buffer: require.resolve("buffer/"),
    crypto: require.resolve("crypto-browserify"),
    process: require.resolve("process/browser"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
};

webpackConfig.plugins = [
    ...(webpackConfig.plugins || []),
    new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
    }),
];

webpackConfig.module.rules[0].resolve = {
    fullySpecified: false,
};

const babelRule = webpackConfig.module.rules.find((rule) => {
    return Array.isArray(rule.oneOf);
})?.oneOf.find((rule) => {
    return rule.loader && String(rule.loader).includes("babel-loader");
});

if (babelRule && babelRule.include) {
    babelRule.include = [
        babelRule.include,
        path.resolve(__dirname, "cypress"),
        path.resolve(__dirname, "tests/ct"),
    ];
}

webpackConfig.plugins = webpackConfig.plugins || [];
webpackConfig.plugins.push(
    new webpack.DefinePlugin({
        "process.env.NEXT_PUBLIC_CYPRESS_TEST_ROUTE": JSON.stringify("true"),
        "process.env.REACT_APP_HELIUS": JSON.stringify("http://127.0.0.1:8899"),
        "process.env.REACT_APP_THIRDWEB": JSON.stringify("test-thirdweb-client-id"),
        "process.env.REACT_APP_THRIDWEB": JSON.stringify("test-thirdweb-client-id"),
        "process.env.NEXT_PUBLIC_CYPRESS_SOLANA_RPC_URL": JSON.stringify("http://127.0.0.1:8899"),
        "process.env.NEXT_PUBLIC_CYPRESS_TRON_RPC_URL": JSON.stringify("http://127.0.0.1:50051"),
    }),
);

let serversStarted = false;
let testServers = [] as ReturnType<typeof startTestServers>;

const waitForHealth = async (url: string) => {
    for (let attempt = 1; attempt <= 60; attempt += 1) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
        } catch {
            // retry
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    throw new Error(`Timed out waiting for ${url}`);
};

const startServers = async () => {
    if (serversStarted) {
        return;
    }

    clearTestServerPorts();
    testServers = startTestServers();
    await Promise.all([
        waitForHealth("http://127.0.0.1:4101/healthz"),
        waitForHealth("http://127.0.0.1:4102/healthz"),
        waitForHealth("http://127.0.0.1:8899/healthz"),
        waitForHealth("http://127.0.0.1:50051/healthz"),
    ]);
    serversStarted = true;
};

const stopServers = () => {
    if (testServers.length === 0) {
        return;
    }

    stopTestServers(testServers);
    testServers = [];
    serversStarted = false;
};

process.on("exit", stopServers);
process.on("SIGINT", () => {
    stopServers();
    process.exit(130);
});
process.on("SIGTERM", () => {
    stopServers();
    process.exit(143);
});

export default defineConfig({
    component: {
        devServer: {
            bundler: "webpack",
            framework: "react",
            webpackConfig,
        },
        setupNodeEvents(on) {
            on("before:run", async () => {
                await startServers();
            });
            on("after:run", stopServers);
        },
        specPattern: "cypress/component/**/*.cy.{ts,tsx}",
        supportFile: "cypress/support/component.ts",
        viewportHeight: 1080,
        viewportWidth: 1920,
    },
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: ".cypress-videos",
    screenshotsFolder: ".cypress-videos",
});
