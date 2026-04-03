import http from "node:http";

import { loadJson, parseCliArgs, readJsonBody, sendJson, toOperationName } from "./utils.mjs";

const args = parseCliArgs(process.argv.slice(2));
const port = Number(args.port);
const fixturePath = String(args.fixture);
const fixtures = loadJson(fixturePath);

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.url === "/healthz") {
        sendJson(response, 200, { ok: true, fixturePath });
        return;
    }

    if (request.method !== "POST" || request.url !== "/api/graphql") {
        sendJson(response, 404, { error: "Not found" });
        return;
    }

    const body = await readJsonBody(request);
    const operationName = toOperationName(body);
    const data = fixtures[operationName] ?? fixtures.__default;

    if (!data) {
        sendJson(response, 404, {
            errors: [{ message: `No fixture response defined for operation ${operationName}` }],
        });
        return;
    }

    sendJson(response, 200, { data });
});

server.listen(port, "127.0.0.1");
