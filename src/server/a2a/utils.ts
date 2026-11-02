import { randomUUID } from "node:crypto";
import { AgentCard, Message, Role } from "@a2a-js/sdk";
import { AgentEvent, DefaultRequestHandler, InMemoryTaskStore, JsonRpcTransportHandler } from "@a2a-js/sdk/server";
import type { AgentExecutor } from "@a2a-js/sdk/server";
import { RequestMalformedError, UnsupportedOperationError } from "@a2a-js/sdk/errors";
import { buildSiteUrl } from "../../siteUrl";
import { tribeSearchSchema } from "../../tribeSearch/utils";
import { fetchTribeSearchResult } from "../tribeSearch/utils";
import { buildTribeJsonResponse } from "../tribeSearch/results/utils";

export const buildSearchAgentCard = (): AgentCard =>
    AgentCard.fromJSON({
        name: "Nswap public marketplace search",
        description:
            "Read-only, source-qualified tribe and service lookup. Send a structured data part with entity, tribe or tribeId, optional q, serverUrl, page and limit. No writes, private account data, payment or autonomous transactions are supported here; use OAuth MCP for user-authorized account actions.",
        version: "1.0.0",
        documentationUrl: buildSiteUrl("/openapi.json"),
        supportedInterfaces: [{ url: buildSiteUrl("/api/a2a"), protocolBinding: "JSONRPC", protocolVersion: "1.0" }],
        capabilities: { streaming: false, pushNotifications: false },
        defaultInputModes: ["application/json"],
        defaultOutputModes: ["application/json"],
        skills: [
            {
                id: "tribe-search",
                name: "Find affiliated marketplace records",
                description:
                    "Authoritative tribe filtering followed by lexical service matching over actual company and related-product descriptions. Data fields match GET /api/search/tribe. Preserve source URLs and follow links.next for continuation.",
                tags: ["companies", "products", "jobs", "tribes", "search"],
                examples: [JSON.stringify({ entity: "companies", tribe: "Liberland", q: "web development" })],
                inputModes: ["application/json"],
                outputModes: ["application/json"],
            },
        ],
    });

const executor: AgentExecutor = {
    execute: async (context, events) => {
        const part = context.userMessage.parts.find((candidate) => candidate.content?.$case === "data");
        if (!part || part.content?.$case !== "data") {
            throw new RequestMalformedError({
                message: "Send a data part containing entity and tribe or tribeId; see the agent card.",
            });
        }
        const input = tribeSearchSchema.safeParse(part.content.value);
        if (!input.success) {
            throw new RequestMalformedError({ message: input.error.message });
        }
        const result = buildTribeJsonResponse(await fetchTribeSearchResult(input.data));
        events.publish(
            AgentEvent.message(
                Message.fromJSON({
                    messageId: randomUUID(),
                    contextId: context.contextId,
                    role: Role.ROLE_AGENT,
                    parts: [{ data: result, mediaType: "application/json" }],
                }),
            ),
        );
        events.finished();
    },
    cancelTask: async () => {
        throw new UnsupportedOperationError({
            message: "This read-only agent returns immediate messages, not persistent tasks.",
        });
    },
};

// Per-request state: no public client can retrieve another caller's stored tasks.
export const createSearchAgentTransport = () =>
    new JsonRpcTransportHandler(new DefaultRequestHandler(buildSearchAgentCard(), new InMemoryTaskStore(), executor));
