import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
    testDir: "./tests/ct",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    timeout: 45000,
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    outputDir: "/tmp/liberstake-marketplace-frontend-playwright-results",
    reporter: [["list"], ["html", { open: "never", outputFolder: "/tmp/liberstake-marketplace-frontend-playwright-report" }]],
    use: {
        ctPort: 3100,
        ctViteConfig: {
            define: {
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE": JSON.stringify("true"),
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_SOLANA_RPC_URL": JSON.stringify("http://127.0.0.1:8899"),
                "process.env.NEXT_PUBLIC_PLAYWRIGHT_TRON_RPC_URL": JSON.stringify("http://127.0.0.1:50051"),
            },
        },
        trace: "on-first-retry",
        screenshot: "only-on-failure",
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
