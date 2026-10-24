import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { normalizePublicBackendUrl, publicBackendFetch } from "../server/security/utils";
import { BACKEND_TIMEOUT_MS } from "../server/security/constants";
import type { BackendAuthorization } from "./types";

export const normalizeBackendUrl = (value: string): string => {
    return normalizePublicBackendUrl(value);
};

export const authorizationForBackend = (authorization: BackendAuthorization | undefined, serverUrl: string): string | undefined => {
    return authorization && normalizeBackendUrl(authorization.serverUrl) === normalizeBackendUrl(serverUrl)
        ? authorization.value
        : undefined;
};

export const callBackendTool = async (
    serverUrl: string,
    authorization: BackendAuthorization | undefined,
    toolName: string,
    argumentsValue: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<unknown> => {
    const token = authorizationForBackend(authorization, serverUrl);
    const transport = new StreamableHTTPClientTransport(new URL(`${normalizeBackendUrl(serverUrl)}/api/mcp`), {
        requestInit: { headers: token ? { Authorization: token } : undefined, signal },
        fetch: publicBackendFetch,
    });
    const client = new Client({ name: "nswap-mcp-gateway", version: "1.0.0" });

    try {
        await client.connect(transport);
        const result = await client.callTool({ name: toolName, arguments: argumentsValue }, undefined, {
            timeout: BACKEND_TIMEOUT_MS,
            signal,
        }) as {
            isError?: boolean;
            content: Array<{ type: string; text?: string }>;
            structuredContent?: unknown;
        };

        if (result.isError) {
            throw new Error(result.content.map((item) => item.type === "text" ? item.text : "Backend MCP tool failed.").join("\n"));
        }

        const hasTextContent = result.content.some((item) => item.type === "text" && item.text);

        return hasTextContent ? result.content : result.structuredContent ?? result.content;
    } finally {
        await client.close();
    }
};

type McpTextContent = { type: "text"; text?: string };

type RagResponse = {
    error?: string;
    [key: string]: unknown;
};

export const parseBackendToolResult = <T>(value: unknown): T => {
    if (Array.isArray(value)) {
        const textContent = value.find((item: McpTextContent) => item.type === "text" && item.text);
        if (textContent?.text) return JSON.parse(textContent.text) as T;
    }
    return value as T;
};

export const searchBackendRag = async (
    serverUrl: string,
    authorization: BackendAuthorization | undefined,
    query: string,
    limit?: number,
    signal?: AbortSignal,
): Promise<unknown> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = authorizationForBackend(authorization, serverUrl);
    if (token) {
        headers.Authorization = token;
    }
    const response = await publicBackendFetch(`${normalizeBackendUrl(serverUrl)}/api/ai/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, limit }),
        signal,
    });
    const body = await response.json() as RagResponse;
    if (!response.ok) {
        const detail = typeof body.error === "string" ? `: ${body.error}` : ".";
        throw new Error(`RAG search failed on ${serverUrl}${detail}`);
    }

    return body;
};
