describe("Public gateway security boundaries", { retries: 0 }, () => {
    it("preserves personal and global search allowances when shared capacity rejects work", () => {
        cy.task("gatewaySearchRejectionPreservesBudgets").should("equal", true);
    });
    it("binds RAG source provenance to the backend that actually returned it", () => {
        cy.task("gatewayBindsRagProvenance").should("equal", true);
    });
    it("backs off repeated failed Poppy discovery calls", () => {
        cy.task("gatewayBacksOffFailedPoppyDiscovery").should("equal", true);
    });
    it("rejects fabricated authorization before allocating a syndicated session", () => {
        cy.task("gatewayRejectsUnverifiedSession").should("equal", true);
    });
    it("does not disclose private DNS resolution details", () => {
        cy.task("gatewayDoesNotDisclosePrivateDns").should("equal", true);
    });
    it("does not let rejected traffic exhaust other clients global request budget", () => {
        cy.task("gatewayRejectedTrafficDoesNotStarveOtherClients").should("equal", true);
    });
});
