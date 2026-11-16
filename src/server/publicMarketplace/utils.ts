import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import type { util } from "zod/v4/core";
import { createNswapMcpServer } from "../../mcp/server";
import { parseBackendToolResult } from "../../mcp/backend";
import { getDefaultBackendUrl } from "../../mcp/routing";
import { buildSiteUrl } from "../../siteUrl";
import { REQUEST_TIMEOUT_MS } from "../security/constants";
import { PUBLIC_MARKETPLACE_TOOLS } from "./constants";
import { publicMarketplaceSchema, comparisonResultSchema, listingPaginationSchema, jsonValueSchema } from "./schema";

/**
 * Unwrap the MCP response into ordinary JSON for HTTP readers. Directory discovery
 * already returns plain data; comparisons add a per-backend wrapper, while other
 * tools return backend MCP content blocks that need one more decoding step.
 */
const readToolData = (operation: keyof typeof PUBLIC_MARKETPLACE_TOOLS, value: util.JSONType) => {
    if (operation === "servers") {
        return value;
    }
    if (operation === "compare") {
        const entry = comparisonResultSchema.parse(value)[0];
        if (entry.error) {
            throw new Error(entry.error);
        }
        return jsonValueSchema.parse(parseBackendToolResult(entry.result));
    }
    return jsonValueSchema.parse(parseBackendToolResult(value));
};

/**
 * Run the selected read-only tool against each explicit backend, or the configured
 * default. The SDK links a local client and gateway in memory: HTTP callers need
 * no MCP client, and the existing tool handlers still own the marketplace logic.
 * Each result retains its queried source URL. Backend failures are isolated so
 * successful sources remain available. Both SDK connections close on completion.
 */
export const executePublicMarketplaceRead = async (
    input: z.infer<typeof publicMarketplaceSchema>,
    clientKey: string,
    signal: AbortSignal,
) => {
    const { operation, serverUrl, ...args } = input;
    const servers = Array.from(new Set(serverUrl ? [serverUrl].flat() : [getDefaultBackendUrl()]));
    // No caller credentials or session cookies cross this public read-only adapter.
    const server = createNswapMcpServer(undefined, undefined, clientKey, signal);
    const client = new Client({ name: "nswap-public-http", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport, { signal });
        return await Promise.all(
            servers.map(async (source) => {
                try {
                    const result = CallToolResultSchema.parse(
                        await client.callTool(
                            {
                                name: PUBLIC_MARKETPLACE_TOOLS[operation],
                                arguments: { ...args, serverUrl: source },
                            },
                            CallToolResultSchema,
                            { signal, timeout: REQUEST_TIMEOUT_MS },
                        ),
                    );
                    if (result.isError) {
                        throw new Error(
                            result.content
                                .filter((item) => item.type === "text")
                                .map((item) => item.text)
                                .join("\n") || "Backend tool failed.",
                        );
                    }
                    return {
                        serverUrl: source,
                        result: readToolData(operation, jsonValueSchema.parse(parseBackendToolResult(result.content))),
                    };
                } catch (error) {
                    console.error("Public marketplace read failed", source, error);
                    return {
                        serverUrl: source,
                        error: error instanceof Error ? error.message : "Backend unavailable.",
                    };
                }
            }),
        );
    } finally {
        await client.close();
        await server.close();
    }
};

/**
 * Attach source-preserving continuation URLs to the decoded results. Repeated
 * backend URLs and filters survive pagination; a next link is offered if any
 * backend reports another page, up to the request schema's page limit.
 */
export const buildPublicMarketplaceResponse = (
    input: z.infer<typeof publicMarketplaceSchema>,
    queryParams: Record<string, string | string[] | undefined>,
    results: Awaited<ReturnType<typeof executePublicMarketplaceRead>>,
) => {
    const url = new URL(buildSiteUrl(`/api/marketplace/${input.operation}`));
    Object.entries(queryParams)
        .filter(([name]) => name !== "operation")
        .forEach(([name, value]) => {
            if (value !== undefined) {
                [value].flat().forEach((item) => url.searchParams.append(name, item));
            }
        });
    /** Change only the page number, keeping the original operation, filters and backend selection. */
    const atPage = (number: number) => {
        const link = new URL(url);
        link.searchParams.set("page", String(number));
        return link.href;
    };
    return {
        results,
        links: {
            self: url.href,
            next:
                "page" in input &&
                input.page < 10000 &&
                results.some((entry) => {
                    const pagination = listingPaginationSchema.safeParse(entry.result);
                    return pagination.success && pagination.data.hasNextPage;
                })
                    ? atPage(input.page + 1)
                    : null,
            previous: "page" in input && input.page > 1 ? atPage(input.page - 1) : null,
        },
    };
};
