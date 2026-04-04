import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../..");
const playwrightBinary = path.resolve(rootDir, "node_modules/.bin/playwright");
const serveScript = path.resolve(rootDir, "tests/ct/serve.ts");

const args = process.argv.slice(2);

const serve = spawn(
    process.execPath,
    ["--import", "tsx", serveScript],
    {
        cwd: rootDir,
        env: process.env,
        stdio: ["ignore", "pipe", "inherit"],
    },
);

let playwrightProcess: ChildProcess | null = null;
const serveExitPromise = new Promise<void>((resolve) => {
    serve.on("exit", () => {
        resolve();
    });
});

const waitForReady = async () => {
    return await new Promise<void>((resolve, reject) => {
        let buffer = "";
        let resolved = false;

        serve.stdout?.setEncoding("utf8");
        serve.stdout?.on("data", (chunk: string) => {
            buffer += chunk;
            process.stdout.write(chunk);

            if (!resolved && buffer.includes("CT services are ready.")) {
                resolved = true;
                resolve();
            }
        });

        serve.on("error", (error) => {
            reject(error);
        });

        serve.on("exit", (code, signal) => {
            if (!resolved) {
                reject(new Error(`CT services exited early${signal ? ` with signal ${signal}` : ` with code ${code ?? 1}`}`));
                return;
            }
        });
    });
};

const shutdown = (signal: NodeJS.Signals | "SIGKILL" = "SIGTERM") => {
    if (!serve.killed) {
        serve.kill(signal);
    }
};

process.on("SIGINT", () => {
    shutdown("SIGTERM");
    process.exit(130);
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
    process.exit(143);
});

const main = async () => {
    await waitForReady();

    const playwright = spawn(playwrightBinary, ["test", ...args], {
        cwd: rootDir,
        env: {
            ...process.env,
            CT_EXTERNAL_SERVERS: "true",
            NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE: "true",
            NEXT_PUBLIC_PLAYWRIGHT_SOLANA_RPC_URL: "http://127.0.0.1:8899",
            NEXT_PUBLIC_PLAYWRIGHT_TRON_RPC_URL: "http://127.0.0.1:50051",
        },
        stdio: "inherit",
    });

    playwrightProcess = playwright;

    const exitCode = await new Promise<number>((resolve, reject) => {
        playwright.on("error", reject);
        playwright.on("exit", (code, signal) => {
            if (signal) {
                resolve(signal === "SIGINT" ? 130 : signal === "SIGTERM" ? 143 : 1);
                return;
            }

            resolve(code ?? 1);
        });
    });

    shutdown("SIGTERM");
    await serveExitPromise;
    process.exit(exitCode);
};

void main().catch((error) => {
    console.error(error);
    shutdown("SIGTERM");
    process.exit(1);
});
