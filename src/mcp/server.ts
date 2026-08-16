import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callBackendTool, parseBackendToolResult, searchBackendRag } from "./backend";
import { resolveBackendUrl, resolveSessionServers } from "./routing";
import { buildCheckoutPaymentSummary, createCheckoutLink, type CheckoutCartSnapshot } from "./checkout";
import { addSyndicatedServer, listSyndicatedServers, removeSyndicatedServer } from "./session";
import { MCP_ENTITIES } from "./types";

const entitySchema = z.enum(MCP_ENTITIES);
const requiredBackendSchema = z.object({ serverUrl: z.url() });
const backendSchema = z.object({ serverUrl: z.url().optional() });
const jsonObjectSchema = z.record(z.string(), z.unknown());
const DISCOVERY_INSTRUCTIONS = "Nswap is a syndicated marketplace gateway. It does not own all marketplace data: each backend is an independent server with its own users, entities, permissions, carts, orders, and GraphQL schema. The gateway can fan out read-only list, search, and get operations across reachable backends, while create, update, delete, cart, payment, and fulfillment operations must target the backend that owns the data. There are two server sets: the active session cache, which add_syndicated_server and remove_syndicated_server mutate, and each backend's listed syndicated servers, which are discovered read-only and must never be changed by those tools. Call discover_syndicated_servers when you need the complete reachable directory; call list_syndicated_servers to inspect only the active session cache. Before using a backend's operations, call describe_backend and then describe_entity_schema for the relevant entity. There is no single selected server: choose a returned serverUrl based on ownership, capability, or the user's request, and never invent URLs, entities, fields, filters, or mutation shapes.";

type ListedSyndicatedServer = { serverUrl: string };
type ListedSyndicatedServersResult = { servers?: ListedSyndicatedServer[] };

const callBackend = (authorization: string | undefined, toolName: string, args: Record<string, unknown>, defaultServerUrl?: string | null) => {
    const { serverUrl, ...backendArguments } = args;
    const requestedServerUrl = typeof serverUrl === "string" ? serverUrl : defaultServerUrl;
    return callBackendTool(resolveBackendUrl(requestedServerUrl), authorization, toolName, backendArguments);
};

const callAllBackends = async (authorization: string | undefined, toolName: string, args: Record<string, unknown>, serverUrl?: string) => Promise.all(
    resolveSessionServers(authorization, serverUrl).map(async (resolvedServerUrl) => ({
        serverUrl: resolvedServerUrl,
        result: await callBackendTool(resolvedServerUrl, authorization, toolName, args),
    })),
);

const textResult = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
});

const requireAuthorization = (authorization?: string): string => {
    if (!authorization) throw new Error("Authentication is required.");
    return authorization;
};

export const createNswapMcpServer = (authorization?: string, selectedServerUrl?: string | null): McpServer => {
    const call = (auth: string | undefined, toolName: string, args: Record<string, unknown>) => callBackend(auth, toolName, args, selectedServerUrl);
    const callAll = (auth: string | undefined, toolName: string, args: Record<string, unknown>, serverUrl?: string) => {
        if (serverUrl || !selectedServerUrl) {
            return callAllBackends(auth, toolName, args, serverUrl);
        }

        return Promise.resolve([{ serverUrl: selectedServerUrl, result: callBackend(auth, toolName, args, selectedServerUrl) }]);
    };
    const server = new McpServer({ name: "nswap-syndicated-marketplace", version: "1.0.0" }, { instructions: DISCOVERY_INSTRUCTIONS });

    server.registerTool("add_syndicated_server", {
        description: "Add a syndicated backend to this authenticated MCP session. Its URL will be used by aggregate list/search/get operations.",
        inputSchema: { ...requiredBackendSchema.shape },
    }, async (args) => {
        if (!authorization) throw new Error("Authentication is required.");
        return textResult({ servers: addSyndicatedServer(authorization, args.serverUrl) });
    });

    server.registerTool("list_syndicated_servers", {
        description: "List only the syndicated backends in this authenticated session's active cache. This does not query or modify any backend's public syndication directory.",
        inputSchema: {},
    }, async () => {
        if (!authorization) throw new Error("Authentication is required.");
        return textResult({ servers: listSyndicatedServers(authorization) });
    });

    server.registerTool("discover_syndicated_servers", {
        description: "Recursively query every reachable backend's listed syndication directory and return one unique list. This is read-only and never changes the active session cache or any backend directory.",
        inputSchema: { serverUrl: z.url().optional() },
    }, async (args) => {
        const visited = new Set<string>();
        const reachable: string[] = [];
        const failed: Array<{ serverUrl: string; error: string }> = [];
        const visit = async (serverUrl: string): Promise<void> => {
            const normalized = resolveBackendUrl(serverUrl);
            if (visited.has(normalized)) return;
            visited.add(normalized);
            reachable.push(normalized);

            try {
                const response = parseBackendToolResult<ListedSyndicatedServersResult>(await callBackendTool(normalized, authorization, "list_syndicated_servers", {}));
                await Promise.all((response.servers ?? []).map((entry) => visit(entry.serverUrl)));
            } catch (error) {
                failed.push({ serverUrl: normalized, error: error instanceof Error ? error.message : "Backend discovery failed." });
            }
        };

        const roots = args.serverUrl ? [resolveBackendUrl(args.serverUrl)] : resolveSessionServers(authorization);
        await Promise.all(roots.map((serverUrl) => visit(serverUrl)));
        return textResult({ servers: reachable, failed });
    });

    server.registerTool("remove_syndicated_server", {
        description: "Remove a syndicated backend from this authenticated MCP session.",
        inputSchema: { ...requiredBackendSchema.shape },
    }, async (args) => {
        if (!authorization) throw new Error("Authentication is required.");
        return textResult({ servers: removeSyndicatedServer(authorization, args.serverUrl) });
    });

    server.registerTool("search_rag", {
        description: "Run semantic search over descriptions, posts, jobs, companies, products, identities, and other indexed backend content.",
        inputSchema: { serverUrl: z.url().optional(), query: z.string().min(1).max(600), limit: z.number().int().positive().max(20).optional() },
    }, async (args) => {
        const servers = resolveSessionServers(authorization, args.serverUrl);
        return textResult(await Promise.all(servers.map(async (serverUrl) => ({ serverUrl, result: await searchBackendRag(serverUrl, authorization, args.query, args.limit) }))));
    });

    server.registerTool("compare_products", {
        description: "Compare products across the selected backend or all registered syndicated backends.",
        inputSchema: { ...backendSchema.shape, query: z.string().min(1).max(200), limit: z.number().int().positive().max(100).default(20), where: z.record(z.string(), z.unknown()).optional() },
    }, async (args) => {
        return textResult(await callAll(authorization, "search_entities", { entity: "products", query: args.query, limit: args.limit, where: args.where }, args.serverUrl));
    });

    server.registerTool("list_user_orders", {
        description: "List the authenticated user's orders across all registered syndicated backends.",
        inputSchema: { page: z.number().int().positive().default(1), limit: z.number().int().positive().max(100).default(20) },
    }, async (args) => {
        if (!authorization) throw new Error("Authentication is required.");
        return textResult(await callAll(authorization, "list_entities", { entity: "orders", page: args.page, limit: args.limit }));
    });

    server.registerTool("payment_status", {
        description: "Report the payment status of the authenticated user's orders across syndicated backends.",
        inputSchema: { orderId: z.string().min(1).optional(), serverUrl: z.url().optional() },
    }, async (args) => {
        if (!authorization) throw new Error("Authentication is required.");
        return textResult(await callAll(authorization, "list_entities", { entity: "orders", limit: 100, where: args.orderId ? { id: { equals: args.orderId } } : undefined }, args.serverUrl));
    });

    server.registerTool("prepare_payment", {
        description: "Prepare payment information for an order without signing or sending a transaction. Returns normalized chains, recipients, amounts, and wallet requirements.",
        inputSchema: { ...backendSchema.shape, orderId: z.string().min(1) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "prepare_payment", args));
    });

    server.registerTool("create_checkout_link", {
        description: "Create a link to the existing order and payment flow for carts from one or more syndicated backends. The user must review and submit the order in the app.",
        inputSchema: { carts: z.array(z.object({ serverUrl: z.url(), secret: z.string().min(1) })).min(1) },
    }, async (args) => {
        const snapshots = await Promise.all(args.carts.map(async (cart) => {
            const response = await call(authorization, "cart_get", cart) as CheckoutCartSnapshot;
            return { ...response, serverUrl: cart.serverUrl, secret: cart.secret };
        }));
        return textResult({ checkoutUrl: createCheckoutLink(args.carts), paymentSummary: buildCheckoutPaymentSummary(snapshots) });
    });

    server.registerTool("wallet_capabilities", {
        description: "Return the authenticated user's available ETH, SOL, and TRX wallets for payment.",
        inputSchema: { ...backendSchema.shape },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "wallet_capabilities", args));
    });
    server.registerTool("list_seller_orders", {
        description: "List product/payment rows ordered by other users for the authenticated seller, matching the Orders tab. Use fulfilled or rejected filters to find pending work.",
        inputSchema: { ...backendSchema.shape, fulfilled: z.boolean().optional(), rejected: z.boolean().optional(), limit: z.number().int().positive().max(100).default(20), page: z.number().int().positive().default(1) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "list_seller_orders", args));
    });
    server.registerTool("mark_seller_order_item_fulfilled", {
        description: "Mark one seller order item as fulfilled after it has been shipped or delivered. Requires explicit confirmation.",
        inputSchema: { ...backendSchema.shape, fulfilled: z.boolean().default(true), orderId: z.string().min(1), paymentProofId: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "mark_seller_order_item_fulfilled", args));
    });
    server.registerTool("mark_seller_order_item_rejected", {
        description: "Mark one seller order item as rejected. Requires explicit confirmation.",
        inputSchema: { ...backendSchema.shape, rejected: z.boolean().default(true), orderId: z.string().min(1), paymentProofId: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "mark_seller_order_item_rejected", args));
    });
    server.registerTool("list_shipping_addresses", {
        description: "List saved shipping addresses. Save one before checkout if none exists.",
        inputSchema: { ...backendSchema.shape },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "list_shipping_addresses", args));
    });
    server.registerTool("update_shipping_address", {
        description: "Update the saved shipping address on the selected backend before checkout.",
        inputSchema: { ...backendSchema.shape, address: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "update_shipping_address", args));
    });
    server.registerTool("save_shipping_address", {
        description: "Save a shipping address on the selected backend before checkout.",
        inputSchema: { ...backendSchema.shape, address: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "save_shipping_address", args));
    });
    server.registerTool("delete_shipping_address", {
        description: "Delete a saved shipping address after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "delete_shipping_address", args));
    });
    server.registerTool("create_post", {
        description: "Create a post on the selected backend after explicit publishing confirmation.",
        inputSchema: { ...backendSchema.shape, data: jsonObjectSchema, confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "create_post", args));
    });
    server.registerTool("update_post", {
        description: "Update a post on the selected backend after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, id: z.string().min(1), data: jsonObjectSchema, confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "update_post", args));
    });
    server.registerTool("reply_to_comment", {
        description: "Reply to a comment on the selected backend after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, content: z.string().min(1).max(50000), company: z.string().min(1), replyPost: z.string().min(1), replyComment: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "reply_to_comment", args));
    });
    server.registerTool("edit_comment", {
        description: "Edit an owned comment after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, id: z.string().min(1), content: z.string().min(1).max(50000), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "edit_comment", args));
    });
    server.registerTool("delete_comment", {
        description: "Delete an owned comment after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, id: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "delete_comment", args));
    });
    server.registerTool("unsubscribe", {
        description: "Remove a subscription after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, id: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "unsubscribe", args));
    });

    server.registerTool("subscribe", {
        description: "Subscribe the authenticated user to a supported entity on the selected backend.",
        inputSchema: { ...backendSchema.shape, entity: z.enum(["companies", "products", "jobs", "ventures", "identities", "posts"]), id: z.string().min(1) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "subscribe_to_entity", args));
    });

    server.registerTool("list_entities", {
        description: "List companies, products/services, jobs, ventures, identities, posts, comments, orders, carts, users, media, syndications, reports, information requests, notification subscriptions, and subscribers from a selected syndicated backend.",
        inputSchema: {
            ...backendSchema.shape,
            entity: entitySchema,
            page: z.number().int().positive().default(1),
            limit: z.number().int().positive().max(100).default(20),
            search: z.string().max(200).optional(),
            where: z.record(z.string(), z.unknown()).optional(),
        },
    }, async (args) => {
        if (args.serverUrl) return textResult(await call(authorization, "list_entities", args));
        return textResult(await callAll(authorization, "list_entities", { entity: args.entity, page: args.page, limit: args.limit, search: args.search, where: args.where }));
    });

    server.registerTool("search_entities", {
        description: "Search any supported entity on a selected syndicated backend, including relationship filters for company, identity, and related entities.",
        inputSchema: {
            ...backendSchema.shape,
            entity: entitySchema,
            query: z.string().min(1).max(200),
            page: z.number().int().positive().default(1),
            limit: z.number().int().positive().max(100).default(20),
            where: z.record(z.string(), z.unknown()).optional(),
        },
    }, async (args) => {
        if (args.serverUrl) return textResult(await call(authorization, "search_entities", args));
        return textResult(await callAll(authorization, "search_entities", { entity: args.entity, query: args.query, page: args.page, limit: args.limit, where: args.where }));
    });

    server.registerTool("get_entity", {
        description: "Retrieve a complete entity from its owning syndicated backend.",
        inputSchema: { ...backendSchema.shape, entity: entitySchema, id: z.string().min(1) },
    }, async (args) => {
        if (args.serverUrl) return textResult(await call(authorization, "get_entity", args));
        return textResult(await callAll(authorization, "get_entity", { entity: args.entity, id: args.id }));
    });

    server.registerTool("describe_entity_schema", {
        description: "Return machine-readable searchable fields, filter operators, and field meanings before using list, search, or update tools.",
        inputSchema: { ...backendSchema.shape, entity: entitySchema },
    }, async (args) => textResult(await call(authorization, "describe_entity_schema", args)));

    server.registerTool("find_related_entities", {
        description: "Find entities related to another entity across the selected backend or all active syndicated backends, such as jobs for a company or products for a company.",
        inputSchema: {
            ...backendSchema.shape,
            entity: entitySchema,
            relatedEntity: entitySchema,
            relatedField: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/),
            relatedId: z.string().min(1),
            page: z.number().int().positive().default(1),
            limit: z.number().int().positive().max(100).default(20),
        },
    }, async (args) => {
        const relatedArguments = { entity: args.relatedEntity, page: args.page, limit: args.limit, where: { [args.relatedField]: { equals: args.relatedId } } };
        if (args.serverUrl) return textResult(await call(authorization, "find_related_entities", relatedArguments));
        return textResult(await callAll(authorization, "find_related_entities", relatedArguments));
    });

    server.registerTool("cart_get", {
        description: "Read a shopping cart from one syndicated backend. Keep its serverUrl and secret because checkout may contain carts from many backends.",
        inputSchema: { ...backendSchema.shape, secret: z.string().min(1) },
    }, async (args) => textResult(await call(authorization, "cart_get", args)));

    server.registerTool("cart_add_item", {
        description: "Shop by adding a product to a selected backend cart. Omit secret to create a cart and retain the returned secret.",
        inputSchema: { ...backendSchema.shape, secret: z.string().min(1).optional(), product: z.string().min(1), variant: z.string().min(1).optional(), quantity: z.number().int().positive(), parameters: z.array(jsonObjectSchema).optional() },
    }, async (args) => textResult(await call(authorization, "cart_add_item", args)));

    server.registerTool("cart_set_item_quantity", {
        description: "Change the quantity of one item in a selected backend cart.",
        inputSchema: { ...backendSchema.shape, secret: z.string().min(1), itemId: z.string().min(1), quantity: z.number().int().positive() },
    }, async (args) => textResult(await call(authorization, "cart_set_item_quantity", args)));

    server.registerTool("cart_remove_item", {
        description: "Remove one item from a selected backend cart.",
        inputSchema: { ...backendSchema.shape, secret: z.string().min(1), itemId: z.string().min(1) },
    }, async (args) => textResult(await call(authorization, "cart_remove_item", args)));

    server.registerTool("cart_clear", {
        description: "Clear a selected backend cart after explicit confirmation.",
        inputSchema: { ...backendSchema.shape, secret: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => textResult(await call(authorization, "cart_clear", args)));

    server.registerTool("create_comment", {
        description: "Create a comment as the authenticated user. Show the exact text and target and obtain explicit confirmation before calling this tool.",
        inputSchema: { ...backendSchema.shape, content: z.string().min(1).max(50000), company: z.string().min(1), replyPost: z.string().min(1), replyComment: z.string().min(1).optional(), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "create_comment", args));
    });

    server.registerTool("create_entity", {
        description: "Create an entity through the owning backend MCP server. The backend GraphQL layer enforces validation, authentication, ownership, and moderation.",
        inputSchema: { ...backendSchema.shape, entity: entitySchema, data: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "create_entity", args));
    });

    server.registerTool("update_entity", {
        description: "Update an entity through the owning backend MCP server. The backend GraphQL layer enforces ownership and permissions.",
        inputSchema: { ...backendSchema.shape, entity: entitySchema, id: z.string().min(1), data: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "update_entity", args));
    });

    server.registerTool("delete_entity", {
        description: "Delete an entity through the owning backend MCP server. Requires explicit confirmation.",
        inputSchema: { ...backendSchema.shape, entity: entitySchema, id: z.string().min(1), confirmation: z.literal(true) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "delete_entity", args));
    });

    server.registerTool("like_entity", {
        description: "Like or unlike a company, product, job, venture, identity, post, or comment through the backend MCP server.",
        inputSchema: { ...backendSchema.shape, entity: z.enum(["companies", "products", "jobs", "ventures", "identities", "posts", "comments"]), id: z.string().min(1), liked: z.boolean() },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "like_entity", args));
    });

    server.registerTool("subscribe_to_entity", {
        description: "Subscribe the authenticated user to updates for a supported entity through the backend MCP server.",
        inputSchema: { ...backendSchema.shape, entity: z.enum(["companies", "products", "jobs", "ventures", "identities", "posts"]), id: z.string().min(1) },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "subscribe_to_entity", args));
    });

    server.registerTool("create_report", {
        description: "Create a report through the owning backend MCP server.",
        inputSchema: { ...backendSchema.shape, data: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "create_report", args));
    });

    server.registerTool("create_information_request", {
        description: "Create an information request through the owning backend MCP server.",
        inputSchema: { ...backendSchema.shape, data: jsonObjectSchema },
    }, async (args) => {
        requireAuthorization(authorization);
        return textResult(await call(authorization, "create_information_request", args));
    });

    server.registerTool("describe_backend", {
        description: "FIRST STEP: discover the specified backend's MCP server identity, tools, entities, and supported operations before calling any other tool. Omit serverUrl to describe the configured default backend.",
        inputSchema: { serverUrl: z.url().optional() },
    }, async (args) => textResult(await call(authorization, "describe_backend", { serverUrl: resolveBackendUrl(args.serverUrl) })));

    return server;
};
