import type {} from "webmcp-types";
import { User } from "oidc-client-ts";
import { JSONRPCMessageSchema, LATEST_PROTOCOL_VERSION, type CallToolResult, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { createAuthManager } from "../../../src/components/auth/utils";
import { MCP_IDENTITY } from "../../../src/agentDiscovery/constants";

export const createWebMcpRegistry = () => {
    const tools = new Map<string, WebMCP.ModelContextTool>();
    return {
        tools,
        controller: new AbortController(),
        context: { registerTool: async (tool: WebMCP.ModelContextTool) => { tools.set(tool.name, tool); } },
    };
};

export const storeWebMcpAccount = async (serverUrl: string, token: string) => {
    await createAuthManager(serverUrl).storeUser(new User({
        access_token: token,
        token_type: "Bearer",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        profile: { iss: `${serverUrl}/api/auth`, sub: "alice", aud: "nswap", iat: 1, exp: 9999999999 },
    }));
};

export const interceptWebMcpGateway = (tools: Tool[], result?: CallToolResult) => {
    cy.intercept("GET", "/api/mcp*", { statusCode: 405 });
    cy.intercept("POST", "/api/mcp*", (request) => {
        const message = JSONRPCMessageSchema.parse(request.body);
        if (!("method" in message)) {
            throw new Error("Expected an MCP request or notification");
        }
        if (!("id" in message)) {
            request.reply({ statusCode: 202, body: "" });
            return;
        }
        const reply = (value: object) => request.reply({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { jsonrpc: "2.0", id: message.id, result: value },
        });
        switch (message.method) {
            case "initialize":
                reply({ protocolVersion: LATEST_PROTOCOL_VERSION, capabilities: { tools: {} }, serverInfo: MCP_IDENTITY });
                return;
            case "tools/list":
                request.alias = "gatewayCatalog";
                reply(message.params?.cursor ? { tools: tools.slice(3) } : { tools: tools.slice(0, 3), nextCursor: "remaining" });
                return;
            case "tools/call":
                request.alias = "gatewayTool";
                reply(result || { content: [{ type: "text", text: JSON.stringify({ name: message.params?.name, arguments: message.params?.arguments }) }] });
                return;
            default:
                throw new Error(`Unexpected MCP method: ${message.method}`);
        }
    });
};
