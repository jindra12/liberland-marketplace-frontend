describe("verified syndicated Poppy discovery", () => {
    it("uses issuer-confirmed domain metadata without changing existing MCP resource identities", () => {
        cy.task("poppyVerifiedDiscovery").should("equal", true);
    });
    it("rejects a backend document naming a different frontend domain", () => {
        cy.task("poppyForeignDomain").should("equal", true);
    });
    it("rejects an issuer that does not confirm ownership of this frontend alias", () => {
        cy.task("poppyUnconfirmedIssuer").should("equal", true);
    });
    it("reports backend failures instead of publishing pretend account/session capabilities", () => {
        cy.task("poppyUnavailableBackend").should("equal", true);
    });
});
