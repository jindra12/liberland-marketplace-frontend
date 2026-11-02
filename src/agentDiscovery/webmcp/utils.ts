import type {} from "webmcp-types";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { BACKEND_URL, getAccessToken } from "../../gqlFetcher";
import type { WebMcpApproval } from "./types";

const withGatewayClient = async <T>(signal: AbortSignal, run: (client: Client) => Promise<T>, serverUrl?: string) => {
    signal.throwIfAborted();
    const url = new URL("/api/mcp", window.location.origin);
    const token = serverUrl ? getAccessToken(serverUrl) : undefined;
    if (token && serverUrl) {
        url.searchParams.set("auth", "required");
        url.searchParams.set("serverUrl", serverUrl);
    }
    const client = new Client({ name: "nswap-webmcp", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(url, {
        requestInit: { credentials: "omit", redirect: "error", headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });
    try {
        await client.connect(transport, { signal });
        return await run(client);
    } finally {
        await client.close();
    }
};

const listGatewayTools = async (client: Client, signal: AbortSignal, cursor?: string): Promise<Tool[]> => {
    const page = await client.listTools({ cursor }, { signal });
    return page.nextCursor ? [...page.tools, ...await listGatewayTools(client, signal, page.nextCursor)] : page.tools;
};

export const registerMarketplaceTools = async (
    context: Pick<WebMCP.ModelContext, "registerTool">,
    signal: AbortSignal,
    approve: WebMcpApproval,
) => {
    const tools = await withGatewayClient(signal, (client) => listGatewayTools(client, signal));
    await Promise.all(tools.map(async (tool) => {
        signal.throwIfAborted();
        await context.registerTool({
            name: tool.name,
            title: tool.title,
            description: tool.description || tool.name,
            inputSchema: tool.inputSchema,
            annotations: {
                readOnlyHint: Boolean(tool.annotations?.readOnlyHint),
                consequentialHint: !tool.annotations?.readOnlyHint,
                untrustedContentHint: true,
            },
            execute: async (input, options) => {
                const executionSignal = AbortSignal.any([signal, options.signal]);
                executionSignal.throwIfAborted();
                if (!tool.annotations?.readOnlyHint && !(await approve(tool, input, executionSignal))) {
                    throw new Error("The user did not approve this action. Nothing was submitted.");
                }
                executionSignal.throwIfAborted();
                // Directory arguments name a server to add/remove, not the account that owns the session.
                const serverUrl = tool._meta?.["nswap/sessionOperation"] || typeof input.serverUrl !== "string"
                    ? new URL(BACKEND_URL).origin : new URL(input.serverUrl).origin;
                const result = CallToolResultSchema.parse(await withGatewayClient(executionSignal, (client) => client.callTool(
                    { name: tool.name, arguments: input }, CallToolResultSchema, { signal: executionSignal },
                ), serverUrl));
                if (result.isError) {
                    throw new Error(result.content.filter((item) => item.type === "text").map((item) => item.text).join("\n") || "MCP tool failed.");
                }
                return JSON.stringify(result);
            },
        }, { signal });
    }));
};
