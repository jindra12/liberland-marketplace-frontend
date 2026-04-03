import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { CliArgs, GraphqlBody, JsonValue } from "./types";

export const loadJson = <T>(filePath: string | URL): T => {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
};

export const parseCliArgs = (argv: string[]): CliArgs => {
    return argv.reduce<CliArgs>((acc, item, index, items) => {
        if (!item.startsWith("--")) {
            return acc;
        }

        const nextItem = items[index + 1];
        return {
            ...acc,
            [item.slice(2)]: nextItem && !nextItem.startsWith("--") ? nextItem : "true",
        };
    }, {});
};

export const readJsonBody = async <T extends JsonValue = GraphqlBody>(request: IncomingMessage): Promise<T> => {
    const body = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        request.on("end", () => {
            resolve(Buffer.concat(chunks).toString("utf8"));
        });

        request.on("error", reject);
    });

    return (body ? JSON.parse(body) : {}) as T;
};

export const sendJson = (response: ServerResponse, statusCode: number, body: JsonValue) => {
    response.writeHead(statusCode, {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-private-network": "true",
        "content-type": "application/json",
    });
    response.end(JSON.stringify(body));
};

export const toOperationName = (body: GraphqlBody): string | undefined => {
    if (typeof body.operationName === "string" && body.operationName) {
        return body.operationName;
    }

    const query = String(body.query ?? "");
    const match = query.match(/(?:query|mutation)\s+([A-Za-z0-9_]+)/);
    return match?.[1];
};
