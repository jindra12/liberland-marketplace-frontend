import { defineConfig } from "cypress";
import fs from "node:fs";
import path from "node:path";
import { format } from "prettier";
import type { GraphQLRequestLogPayload } from "./cypress/support/graphqlMock/types";

const envFile = fs.readFileSync(path.resolve(".env"), "utf8");

envFile.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
        return;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex < 0) {
        return;
    }

    const key = trimmedLine.slice(0, separatorIndex);
    const value = trimmedLine.slice(separatorIndex + 1);
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
});

process.env.REACT_APP_BACKEND_URL = "http://127.0.0.1:3010";

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

            on("task", {
                async saveGraphQLRequestLogs(payload: GraphQLRequestLogPayload) {
                    if (payload.logs.length === 0) {
                        return null;
                    }

                    const networkDir = path.resolve("cypress/artifacts/network");
                    fs.mkdirSync(networkDir, { recursive: true });

                    const targetFile = path.join(networkDir, `${payload.specRelative.replace(/[\\/]/g, "__")}.json`);
                    const existingLogs = fs.existsSync(targetFile)
                        ? (JSON.parse(fs.readFileSync(targetFile, "utf8")) as GraphQLRequestLogPayload["logs"])
                        : [];
                    const nextLogs = existingLogs.concat(payload.logs);
                    const formatted = await format(JSON.stringify(nextLogs), { parser: "json" });
                    fs.writeFileSync(targetFile, formatted);
                    return null;
                },
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
