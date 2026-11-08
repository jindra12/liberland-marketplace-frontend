describe("Federated gateway routing boundaries", { retries: 0 }, () => {
    it("keeps JSON request capacity available while notification streams remain open", () => {
        cy.task("gatewayStreamsPreserveRequestCapacity").should("equal", true);
    });
    it("keeps related metadata queries bound to the responding backend", () => {
        cy.task("gatewayRelatedQueriesRetainSource").should("equal", true);
    });
    it("retains healthy semantic results when a syndicated backend fails", () => {
        cy.task("gatewayRagPreservesHealthyBackends").should("equal", true);
    });
});
