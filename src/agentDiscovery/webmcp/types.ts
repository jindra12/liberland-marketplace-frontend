import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export type WebMcpApproval = (tool: Tool, input: Record<string, unknown>, signal: AbortSignal) => Promise<boolean>;
