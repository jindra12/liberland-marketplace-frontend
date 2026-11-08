describe("Federated protocol resilience", { retries: 0 }, () => {
    it("challenges invalid bearer tokens on an authenticated MCP connection", () => {
        cy.task("gatewayChallengesInvalidBearer");
    });
    it("describes the backend belonging to the authenticated MCP connection", () => {
        cy.task("gatewayDescribeSelectedBackend").should("equal", true);
    });
    it("keeps existing detail pages when optional related data fails", () => {
        cy.task("gatewayOptionalRelationsDoNotHideDetail").should("equal", true);
    });
    it("preserves the primary sitemap when secondary manifests exceed the aggregate budget", () => {
        cy.task("gatewaySitemapPreservesPrimary").should("equal", true);
    });
    it("cancels response-body reads when the caller aborts after headers", () => {
        cy.task("gatewayAbortsResponseBody").should("equal", true);
    });
});
