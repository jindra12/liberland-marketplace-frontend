import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export const normalizeBackendUrl = (value: string): string => {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
        throw new Error("Syndicated backends must use HTTPS.");
    }

    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/+$/, "");
};

export const callBackendTool = async (
    serverUrl: string,
    authorization: string | undefined,
    toolName: string,
    argumentsValue: Record<string, unknown>,
): Promise<unknown> => {
    const transport = new StreamableHTTPClientTransport(new URL(`${normalizeBackendUrl(serverUrl)}/api/mcp`), {
        requestInit: authorization ? { headers: { Authorization: authorization } } : undefined,
    });
    const client = new Client({ name: "nswap-mcp-gateway", version: "1.0.0" });

    try {
        await client.connect(transport);
        const result = await client.callTool({ name: toolName, arguments: argumentsValue }) as {
            isError?: boolean;
            content: Array<{ type: string; text?: string }>;
            structuredContent?: unknown;
        };

        if (result.isError) {
            throw new Error(result.content.map((item) => item.type === "text" ? item.text : "Backend MCP tool failed.").join("\n"));
        }

        return result.structuredContent ?? result.content;
    } finally {
        await client.close();
    }
};

type McpTextContent = { type: "text"; text?: string };

export const parseBackendToolResult = <T>(value: unknown): T => {
    if (Array.isArray(value)) {
        const textContent = value.find((item: McpTextContent) => item.type === "text" && item.text);
        if (textContent?.text) return JSON.parse(textContent.text) as T;
    }
    return value as T;
};

export const searchBackendRag = async (serverUrl: string, authorization: string | undefined, query: string, limit?: number): Promise<unknown> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authorization) headers.Authorization = authorization;
    const response = await fetch(`${normalizeBackendUrl(serverUrl)}/api/ai/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, limit }),
    });
    const body = await response.json() as unknown;
    if (!response.ok) throw new Error(`RAG search failed on ${serverUrl}.`);
    return body;
};
