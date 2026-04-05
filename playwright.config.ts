import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
    testDir: "./tests/ct",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    timeout: 300000,
    maxFailures: 1,
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    outputDir: ".playwright-videos",
    reporter: [["list"], ["html", { open: "never", outputFolder: ".playwright-report" }]],
    webServer: [
        {
            command:
                "node --import tsx tests/ct/servers/mockGraphqlServer.ts --port 4101 --fixture tests/ct/fixtures/graphql/alpha.scenarios.json",
            url: "http://127.0.0.1:4101/healthz",
            reuseExistingServer: !process.env.CI,
        },
        {
            command:
                "node --import tsx tests/ct/servers/mockGraphqlServer.ts --port 4102 --fixture tests/ct/fixtures/graphql/beta.scenarios.json",
            url: "http://127.0.0.1:4102/healthz",
            reuseExistingServer: !process.env.CI,
        },
        {
            command: "node --import tsx tests/ct/servers/mockSolanaRpcServer.ts --port 8899",
            url: "http://127.0.0.1:8899/healthz",
            reuseExistingServer: !process.env.CI,
        },
        {
            command: "node --import tsx tests/ct/servers/mockTronRpcServer.ts --port 50051",
            url: "http://127.0.0.1:50051/healthz",
            reuseExistingServer: !process.env.CI,
        },
    ],
    use: {
        ctPort: 3100,
        ctViteConfig: {
            define: {
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE": JSON.stringify("true"),
                "process.env.REACT_APP_HELIUS": JSON.stringify("http://127.0.0.1:8899"),
                "process.env.REACT_APP_THIRDWEB": JSON.stringify("test-thirdweb-client-id"),
                "process.env.REACT_APP_THRIDWEB": JSON.stringify("test-thirdweb-client-id"),
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_SOLANA_RPC_URL": JSON.stringify("http://127.0.0.1:8899"),
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_TRON_RPC_URL": JSON.stringify("http://127.0.0.1:50051"),
            },
        },
        trace: "on-first-retry",
        screenshot: "on",
        video: "on",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
            },
        },
        {
            name: "mobile-chromium",
            use: {
                ...devices["Pixel 7"],
            },
        },
    ],
});
