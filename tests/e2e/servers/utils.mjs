import fs from "node:fs";

export const loadJson = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

export const parseCliArgs = (argv) => {
    return argv.reduce((acc, item, index, items) => {
        if (!item.startsWith("--")) {
            return acc;
        }

        const nextItem = items[index + 1];
        acc[item.slice(2)] = nextItem && !nextItem.startsWith("--") ? nextItem : "true";
        return acc;
    }, {});
};

export const readJsonBody = async (request) => {
    const chunks = [];

    for await (const chunk of request) {
        chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString("utf8");
    return body ? JSON.parse(body) : {};
};

export const sendJson = (response, statusCode, body) => {
    response.writeHead(statusCode, {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-private-network": "true",
        "content-type": "application/json",
    });
    response.end(JSON.stringify(body));
};

export const toOperationName = (body) => {
    if (body.operationName) {
        return body.operationName;
    }

    const query = String(body.query ?? "");
    const match = query.match(/(?:query|mutation)\s+([A-Za-z0-9_]+)/);
    return match?.[1];
};
