import React from "react";
import { mount } from "cypress/react";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { registerMarketplaceTools } from "../../src/agentDiscovery/webmcp/utils";
import { WebMcpRegistration } from "../../src/agentDiscovery/WebMcpRegistration";
import { AntProvider } from "../../src/components/AntProvider";
import { BACKEND_URL } from "../../src/gqlFetcher";
import { createWebMcpRegistry, interceptWebMcpGateway, storeWebMcpAccount } from "../support/webMcp/utils";

describe("shared remote MCP and browser WebMCP tools", () => {
    beforeEach(() => {
        cy.task<Tool[]>("agentReadinessToolCatalog").as("catalog");
    });

    it("registers the entire real gateway catalog, including paginated schemas and write tools", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            const approve = cy.stub().resolves(true);
            cy.then(() => registerMarketplaceTools(registry.context, registry.controller.signal, approve)).then(() => {
                expect(registry.tools.size).to.equal(catalog.length);
                catalog.forEach((tool) => {
                    expect(registry.tools.get(tool.name)?.inputSchema).to.deep.equal(tool.inputSchema);
                    expect(registry.tools.get(tool.name)?.description).to.equal(tool.description);
                });
                expect(registry.tools.has("create_entity")).to.equal(true);
                expect(registry.tools.has("cart_add_item")).to.equal(true);
                expect(registry.tools.has("wallet_capabilities")).to.equal(true);
                expect(approve.callCount).to.equal(0);
                registry.controller.abort();
            });
        });
    });

    it("forwards anonymous searches without cookies, tokens or write confirmation", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            const approve = cy.stub().resolves(true);
            cy.then(async () => {
                await registerMarketplaceTools(registry.context, registry.controller.signal, approve);
                const result = await registry.tools.get("find_by_tribe")!.execute({ entity: "companies", tribe: "Liberland" }, { signal: registry.controller.signal });
                expect(String(result)).to.include("Liberland");
                expect(approve.callCount).to.equal(0);
            });
            cy.wait("@gatewayTool").then(({ request }) => {
                expect(request.headers.authorization).to.equal(undefined);
                expect(request.headers.cookie).to.equal(undefined);
            });
        });
    });

    it("uses only the requested backend's existing app login and reads refreshed credentials at invocation", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            cy.then(async () => {
                await registerMarketplaceTools(registry.context, registry.controller.signal, async () => true);
                await storeWebMcpAccount(BACKEND_URL, "default-test-token");
                await storeWebMcpAccount("https://other.example", "other-test-token");
                const result = await registry.tools.get("wallet_capabilities")!.execute({ serverUrl: "https://other.example" }, { signal: registry.controller.signal });
                expect(String(result)).not.to.include("other-test-token");
            });
            cy.wait("@gatewayTool").then(({ request }) => {
                expect(request.headers.authorization).to.equal("Bearer other-test-token");
                expect(new URL(request.url).searchParams.get("serverUrl")).to.equal("https://other.example");
                expect(JSON.stringify(request.body)).not.to.include("test-token");
            });
        });
    });

    it("does not use an added server's credentials to modify the default session directory", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            cy.then(async () => {
                await storeWebMcpAccount(BACKEND_URL, "default-test-token");
                await storeWebMcpAccount("https://other.example", "other-test-token");
                await registerMarketplaceTools(registry.context, registry.controller.signal, async () => true);
                await registry.tools.get("add_syndicated_server")!.execute({ serverUrl: "https://other.example" }, { signal: registry.controller.signal });
            });
            cy.wait("@gatewayTool").then(({ request }) => {
                expect(request.headers.authorization).to.equal("Bearer default-test-token");
                expect(new URL(request.url).searchParams.get("serverUrl")).to.equal(new URL(BACKEND_URL).origin);
            });
        });
    });

    it("does not submit rejected writes or calls from an unregistered document", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            const submitted = cy.spy().as("submitted");
            cy.intercept("POST", "/api/mcp*", (request) => {
                if (request.body.method === "tools/call") {
                    submitted();
                }
            });
            cy.then(async () => {
                await registerMarketplaceTools(registry.context, registry.controller.signal, async () => false);
                try {
                    await registry.tools.get("delete_entity")!.execute({ entity: "posts", id: "post-1", confirmation: true }, { signal: registry.controller.signal });
                    throw new Error("Expected denied write");
                } catch (error) {
                    expect(String(error)).to.include("did not approve");
                }
                registry.controller.abort();
                try {
                    await registry.tools.get("get_entity")!.execute({ entity: "posts", id: "post-1" }, { signal: registry.controller.signal });
                    throw new Error("Expected cancelled call");
                } catch (error) {
                    expect(error).to.have.property("name", "AbortError");
                }
                expect(submitted.callCount).to.equal(0);
            });
        });
    });

    it("shows an Ant Design confirmation and submits an approved write with the same parameters", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog);
            const registry = createWebMcpRegistry();
            cy.document().then((doc) => {
                Object.defineProperty(doc, "modelContext", { configurable: true, value: registry.context });
            });
            mount(<AntProvider><WebMcpRegistration /></AntProvider>);
            cy.wrap(registry.tools).should((tools) => expect(tools.has("create_comment")).to.equal(true));
            const input = { company: "company-1", replyPost: "post-1", content: "A user-approved comment", confirmation: true };
            const completed = cy.stub().as("completed");
            cy.then(() => {
                const execute = async () => {
                    completed(await registry.tools.get("create_comment")!.execute(input, { signal: registry.controller.signal }));
                };
                execute();
            });
            cy.contains("Allow AI action: create_comment?").should("be.visible");
            cy.get(".ant-modal textarea").should("have.value", JSON.stringify(input, null, 2));
            cy.get(".ant-modal").should("not.have.class", "ant-zoom-appear-active").and("not.have.class", "ant-zoom-enter-active")
                .screenshot("WebMCP-user-confirmation");
            cy.contains("button", "Approve action").click();
            cy.wait("@gatewayTool").its("request.body.params.arguments").should("deep.equal", input);
            cy.get("@completed").should("have.been.calledOnce");
        });
    });

    it("propagates backend tool errors instead of reporting a successful action", () => {
        cy.get<Tool[]>("@catalog").then((catalog) => {
            interceptWebMcpGateway(catalog, { isError: true, content: [{ type: "text", text: "Authentication is required." }] });
            const registry = createWebMcpRegistry();
            cy.then(async () => {
                await registerMarketplaceTools(registry.context, registry.controller.signal, async () => true);
                try {
                    await registry.tools.get("wallet_capabilities")!.execute({}, { signal: registry.controller.signal });
                    throw new Error("Expected backend failure");
                } catch (error) {
                    expect(String(error)).to.include("Authentication is required.");
                }
            });
        });
    });
});
