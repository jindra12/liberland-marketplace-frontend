import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    timeout: 45000,
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    outputDir: "/tmp/liberstake-marketplace-frontend-playwright-results",
    reporter: [["list"], ["html", { open: "never", outputFolder: "/tmp/liberstake-marketplace-frontend-playwright-report" }]],
    use: {
        ctPort: 3100,
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
