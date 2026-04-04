import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
    SOLANA_RPC_PORT,
    SOLANA_RPC_URL,
    SYNDICATION_SERVERS,
    TRON_RPC_PORT,
    TRON_RPC_URL,
} from "./fixtures/constants";

type Service = {
    args: string[];
    cwd: string;
    env: NodeJS.ProcessEnv;
    name: string;
    command: string;
    healthUrl: string;
};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../..");

const spawnService = (service: Service) => {
    const child = spawn(service.command, service.args, {
        cwd: service.cwd,
        env: service.env,
        stdio: "inherit",
    });

    child.on("exit", (code, signal) => {
        if (signal) {
            console.error(`[${service.name}] exited with signal ${signal}`);
        } else {
            console.error(`[${service.name}] exited with code ${code}`);
        }
        process.exit(code ?? 1);
    });

    return child;
};

const waitForHealth = async (url: string, label: string) => {
    for (let attempt = 1; attempt <= 60; attempt += 1) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
        } catch {
            // Keep retrying until the service is up.
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    throw new Error(`Timed out waiting for ${label} at ${url}`);
};

const serviceSpecs: Service[] = [
    ...SYNDICATION_SERVERS.map((server) => ({
        args: [
            "--import",
            "tsx",
            path.resolve(rootDir, "tests/e2e/servers/mockGraphqlServer.ts"),
            "--port",
            String(server.port),
            "--fixture",
            path.resolve(rootDir, `tests/e2e/fixtures/graphql/${server.name}.scenarios.json`),
        ],
        cwd: rootDir,
        env: {
            ...process.env,
        },
        healthUrl: `${server.url}/healthz`,
        name: `syndication-${server.name}`,
        command: process.execPath,
    })),
    {
        args: [
            "--import",
            "tsx",
            path.resolve(rootDir, "tests/e2e/servers/mockSolanaRpcServer.ts"),
            "--port",
            String(SOLANA_RPC_PORT),
        ],
        cwd: rootDir,
        env: {
            ...process.env,
        },
        healthUrl: `${SOLANA_RPC_URL}/healthz`,
        name: "solana-rpc",
        command: process.execPath,
    },
    {
        args: [
            "--import",
            "tsx",
            path.resolve(rootDir, "tests/e2e/servers/mockTronRpcServer.ts"),
            "--port",
            String(TRON_RPC_PORT),
        ],
        cwd: rootDir,
        env: {
            ...process.env,
        },
        healthUrl: `${TRON_RPC_URL}/healthz`,
        name: "tron-rpc",
        command: process.execPath,
    },
];

const childProcesses: ChildProcess[] = [];

const shutdown = () => {
    childProcesses.forEach((child) => {
        if (!child.killed) {
            child.kill("SIGTERM");
        }
    });
};

process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
});

process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
});

const main = async () => {
    const serviceProcesses = await Promise.all(
        serviceSpecs.map(async (service) => {
            try {
                const response = await fetch(service.healthUrl);
                if (response.ok) {
                    console.log(`[${service.name}] already running, reusing existing service.`);
                    return null;
                }
            } catch {
                // No existing service, start one below.
            }

            return spawnService(service);
        }),
    );

    serviceProcesses.forEach((child) => {
        if (child) {
            childProcesses.push(child);
        }
    });

    await Promise.all([
        ...SYNDICATION_SERVERS.map((server) => waitForHealth(`${server.url}/healthz`, `syndication-${server.name}`)),
        waitForHealth(`${SOLANA_RPC_URL}/healthz`, "solana-rpc"),
        waitForHealth(`${TRON_RPC_URL}/healthz`, "tron-rpc"),
    ]);

    console.log("E2E services are ready. Leave this process running and run the tests in another terminal.");
    await new Promise<void>(() => {});
};

void main().catch((error) => {
    console.error(error);
    shutdown();
    process.exit(1);
});
