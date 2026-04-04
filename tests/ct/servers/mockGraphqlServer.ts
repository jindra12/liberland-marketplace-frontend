import http from "node:http";
import type { ServerResponse } from "node:http";

import cors from "cors";

import { handleGraphqlOperation } from "./mockGraphqlHandlers/index";
import { createMockGraphqlRuntime } from "./mockGraphqlRuntime";
import type { GraphqlBody, GraphqlOperationResult } from "./types";
import { parseCliArgs, readJsonBody, sendJson, toOperationName } from "./utils";

const args = parseCliArgs(process.argv.slice(2));
const port = Number(args.port);
const fixturePath = String(args.fixture);
const serverURL = `http://127.0.0.1:${port}`;
const runtime = createMockGraphqlRuntime(fixturePath, serverURL);
const corsMiddleware = cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

const sendScenarioSummary = (response: ServerResponse) => {
    sendJson(response, 200, {
        availableScenarios: runtime.getAvailableScenarios(),
        currentScenario: runtime.getCurrentScenario(),
        fixturePath,
        serverURL,
    });
};

const server = http.createServer(async (request, response) => {
    const requestUrl = request.url ?? "";

    if (request.method === "OPTIONS" && requestUrl.startsWith("/api/graphql")) {
        corsMiddleware(request, response, () => {
            response.writeHead(204);
            response.end();
        });
        return;
    }

    if (request.method === "GET" && request.url === "/healthz") {
        sendJson(response, 200, {
            ok: true,
            availableScenarios: runtime.getAvailableScenarios(),
            currentScenario: runtime.getCurrentScenario(),
            fixturePath,
            serverURL,
        });
        return;
    }

    if (request.method === "GET" && request.url === "/__admin/scenarios") {
        sendScenarioSummary(response);
        return;
    }

    if (request.method === "GET" && request.url === "/__state") {
        sendJson(response, 200, runtime.getState());
        return;
    }

    if (request.method === "POST" && request.url === "/__admin/reset") {
        const body = await readJsonBody<{ scenario?: string }>(request);

        try {
            const nextState = runtime.reset(body.scenario);
            sendJson(response, 200, {
                ok: true,
                currentScenario: runtime.getCurrentScenario(),
                state: nextState,
            });
        } catch (error) {
            sendJson(response, 400, {
                ok: false,
                error: error instanceof Error ? error.message : "Could not reset mock GraphQL runtime",
            });
        }
        return;
    }

    if (request.method === "POST" && request.url === "/__admin/scenario") {
        const body = await readJsonBody<{ scenario?: string }>(request);

        try {
            const nextState = runtime.setScenario(String(body.scenario));
            sendJson(response, 200, {
                ok: true,
                currentScenario: runtime.getCurrentScenario(),
                state: nextState,
            });
        } catch (error) {
            sendJson(response, 400, {
                ok: false,
                error: error instanceof Error ? error.message : "Could not switch mock GraphQL scenario",
            });
        }
        return;
    }

    if (request.method !== "POST" || requestUrl !== "/api/graphql") {
        sendJson(response, 404, { error: "Not found" });
        return;
    }

    const body = await readJsonBody<GraphqlBody>(request);
    const operationName = toOperationName(body);

    if (!operationName) {
        sendJson(response, 400, {
            errors: [{ message: "Could not determine GraphQL operation name" }],
        });
        return;
    }

    const result: GraphqlOperationResult = handleGraphqlOperation(
        runtime.getState(),
        operationName,
        body.variables ?? {},
        body.query ?? "",
    );

    if (result.errors) {
        sendJson(response, 200, {
            errors: result.errors,
            data: result.data ?? null,
        });
        return;
    }

    sendJson(response, 200, result);
});

server.listen(port, "127.0.0.1");
