import { serializeJsonLd } from "../../src/jsonLd/utils";

describe("security boundaries", () => {
    it("enforces per-client request limits and charges RAG quota per backend", () => {
        cy.task("securityRateLimits").should("equal", true);
    });

    it("ignores spoofed forwarding headers outside the trusted hosting platform", () => {
        cy.task("securityClientAddress").should("equal", true);
    });
    it("reuses generated detail queries and rejects private destinations before fetching", () => {
        cy.task("securityServerQueries").should("equal", true);
    });
    it("keeps malicious backend metadata inside one inert JSON-LD script", () => {
        const entry = { name: "</script><script>window.compromised=true</script>", description: "A < B" };
        const serialized = serializeJsonLd(entry);
        expect(JSON.parse(serialized)).to.deep.equal(entry);
        cy.document().then((document) => {
            const template = document.createElement("template");
            template.innerHTML = `<script type="application/ld+json">${serialized}</script>`;
            expect(template.content.querySelectorAll("script")).to.have.length(1);
            expect(template.content.querySelector("script")?.textContent).to.equal(serialized);
        });
    });

    it("rejects private IPs, mapped IPv6, URL credentials, and non-HTTPS backends", () => {
        cy.task("securityAddresses").should("equal", true);
    });

    it("blocks DNS results containing private addresses before connecting", () => {
        cy.task("securityDns").should("equal", true);
    });

    it("refuses redirects and caps streamed backend responses", () => {
        cy.task("securityResponseLimits").should("equal", true);
    });

    it("only forwards credentials to their original backend", () => {
        cy.task("securityTokenScope").should("equal", true);
    });

    it("bounds discovery and terminates cycles", () => {
        cy.task("securityDiscovery").should("equal", true);
    });

    it("bounds session storage, does not allocate on reads, and prunes expired sessions", () => {
        cy.task("securitySessions").should("equal", true);
    });

    it("caps active requests and safely releases capacity", () => {
        cy.task("securityConcurrency").should("equal", true);
    });
});
