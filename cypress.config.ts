import { defineConfig } from "cypress";
import fs from "node:fs";
import path from "node:path";

process.env.REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "http://127.0.0.1:3010";

export default defineConfig({
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: false,
    screenshotsFolder: "cypress/artifacts/screenshots",
    videosFolder: "cypress/artifacts/videos",
    viewportWidth: 1200,
    viewportHeight: 1200,
    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
        specPattern: "cypress/component/**/*.cy.tsx",
        supportFile: "cypress/support/component.ts",
        setupNodeEvents(on) {
            on("before:run", () => {
                fs.rmSync(path.resolve("cypress/artifacts"), { recursive: true, force: true });
            });

            on("after:spec", (spec, results) => {
                const reportDir = path.resolve("cypress/artifacts/reports");
                fs.mkdirSync(reportDir, { recursive: true });

                const lines = [
                    `# ${spec.name}`,
                    "",
                    `- Status: ${results.stats.failures > 0 ? "failed" : "passed"}`,
                    `- Tests: ${results.stats.tests}`,
                    `- Passes: ${results.stats.passes}`,
                    `- Failures: ${results.stats.failures}`,
                    `- Pending: ${results.stats.pending}`,
                    `- Duration: ${results.stats.duration ?? 0}ms`,
                    "",
                    "## Tests",
                    "",
                    ...results.tests.map((test) => {
                        const title = test.title.join(" > ");
                        const state = test.attempts[0]?.state || "unknown";
                        const error = test.displayError ? `\n  - Error: ${test.displayError}` : "";

                        return `- [${state}] ${title}${error}`;
                    }),
                    "",
                ];

                fs.writeFileSync(path.join(reportDir, `${spec.relative.replace(/[\\/]/g, "__")}.md`), lines.join("\n"));
            });
        },
    },
});
