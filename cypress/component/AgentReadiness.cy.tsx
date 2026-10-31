
describe("agent readiness discovery and protocols", () => {
    it("publishes valid upstream MCP, AI catalog and OpenAPI documents with truthful capabilities", () => {
        cy.task("agentReadinessDocuments").should("equal", true);
    });
    it("publishes discoverable skills with accurate content digests", () => {
        cy.task("agentReadinessSkills").should("equal", true);
    });
    it("serves GET/HEAD documents and canonical backend redirects without accepting private sources", () => {
        cy.task("agentReadinessHandlers").should("equal", true);
    });
    it("preserves backend-qualified OAuth resource identities and challenge discovery", () => {
        cy.task("agentReadinessAuth").should("equal", true);
    });
    it("negotiates real Markdown, preserves filters and prevents cross-representation caching", () => {
        cy.task("agentReadinessMarkdown").should("equal", true);
    });
    it("performs actual SDK A2A search and rejects private entity requests without forwarding tokens", () => {
        cy.task("agentReadinessA2a").should("equal", true);
    });
});
