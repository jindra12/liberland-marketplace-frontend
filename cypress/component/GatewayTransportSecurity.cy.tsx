describe("Gateway transport and write authorization", { retries: 0 }, () => {
    it("bounds concurrent backend traffic from one federated tool call", () => {
        cy.task("gatewayBoundsConcurrentFanout").should("equal", true);
    });
    it("streams a live HTTP response without waiting for the peer to close", () => {
        cy.task("gatewayStreamsHeadersWithoutBuffering").should("equal", true);
    });
    it("refreshes expired credentials through a real SDK HTTP connection", () => {
        cy.task("gatewayHttpRefreshesExpiredCredentials").should("equal", true);
    });
    it("successfully refreshes the same SDK client when HTTP actually challenges its expired token", () => {
        cy.task("gatewayHttpRefreshesExpiredCredentials", true).should("equal", true);
    });
    it("rejects anonymous and cross-source writes while allowing the authenticated owning source", () => {
        cy.task("gatewayWritesRemainSourceAuthorized").should("equal", true);
    });
});
