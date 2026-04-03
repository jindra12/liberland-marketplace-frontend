import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

import {
    FRONTEND_PORT,
    PLAYWRIGHT_BASE_URL,
    PLAYWRIGHT_ROUTE_PATH,
    SOLANA_RPC_PORT,
    SOLANA_RPC_URL,
    SYNDICATION_SERVERS,
    TRON_RPC_PORT,
    TRON_RPC_URL,
} from "./tests/e2e/fixtures/constants";

const rootDir = process.cwd();

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    outputDir: "/tmp/liberstake-marketplace-frontend-playwright-results",
    reporter: [["list"], ["html", { open: "never", outputFolder: "/tmp/liberstake-marketplace-frontend-playwright-report" }]],
    use: {
        baseURL: PLAYWRIGHT_BASE_URL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
            },
        },
    ],
    webServer: [
        {
            command: `bash -lc "cd ${rootDir} && PORT=${FRONTEND_PORT} NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE=true NEXT_PUBLIC_PLAYWRIGHT_SOLANA_RPC_URL=${SOLANA_RPC_URL} NEXT_PUBLIC_PLAYWRIGHT_TRON_RPC_URL=${TRON_RPC_URL} ./node_modules/.bin/next dev -H 127.0.0.1"`,
            url: `${PLAYWRIGHT_BASE_URL}${PLAYWRIGHT_ROUTE_PATH}`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            name: "frontend",
        },
        ...SYNDICATION_SERVERS.map((server) => ({
            command: `./node_modules/.bin/tsx tests/e2e/servers/mockGraphqlServer.ts --port ${server.port} --fixture ${path.resolve(rootDir, `tests/e2e/fixtures/graphql/${server.name}.scenarios.json`)}`,
            url: `${server.url}/healthz`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            name: `syndication-${server.name}`,
        })),
        {
            command: `./node_modules/.bin/tsx tests/e2e/servers/mockSolanaRpcServer.ts --port ${SOLANA_RPC_PORT}`,
            url: `${SOLANA_RPC_URL}/healthz`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            name: "solana-rpc",
        },
        {
            command: `./node_modules/.bin/tsx tests/e2e/servers/mockTronRpcServer.ts --port ${TRON_RPC_PORT}`,
            url: `${TRON_RPC_URL}/healthz`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            name: "tron-rpc",
        },
    ],
});
