import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const root = path.resolve(process.cwd());
const mockPorts = ["4101", "4102", "8899", "50051"];

const killPort = (port: string): void => {
    spawn("fuser", ["-k", `${port}/tcp`], {
        stdio: "ignore",
    });
};

export const clearTestServerPorts = (): void => {
    mockPorts.forEach((port) => {
        killPort(port);
    });
};

const startServer = (args: string[]): ChildProcess => {
    return spawn(process.execPath, args, {
        env: {
            ...process.env,
        },
        stdio: "inherit",
    });
};

export const startTestServers = (): ChildProcess[] => {
    return [
        startServer([
            "--import",
            "tsx",
            path.join(root, "tests/ct/servers/mockGraphqlServer.ts"),
            "--port",
            "4101",
            "--fixture",
            path.join(root, "tests/ct/fixtures/graphql/alpha.scenarios.json"),
        ]),
        startServer([
            "--import",
            "tsx",
            path.join(root, "tests/ct/servers/mockGraphqlServer.ts"),
            "--port",
            "4102",
            "--fixture",
            path.join(root, "tests/ct/fixtures/graphql/beta.scenarios.json"),
        ]),
        startServer([
            "--import",
            "tsx",
            path.join(root, "tests/ct/servers/mockSolanaRpcServer.ts"),
            "--port",
            "8899",
        ]),
        startServer([
            "--import",
            "tsx",
            path.join(root, "tests/ct/servers/mockTronRpcServer.ts"),
            "--port",
            "50051",
        ]),
    ];
};

export const stopTestServers = (servers: ChildProcess[]): void => {
    servers.forEach((server) => {
        if (!server.killed) {
            server.kill("SIGTERM");
        }
    });
};
