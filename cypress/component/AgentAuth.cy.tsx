describe("agent client authentication and interoperability", () => {
    it("lets the official A2A client discover the card and perform a public company lookup", () => {
        cy.task("agentA2aSdkClient").should("equal", true);
    });
    it("uses PKCE and offline access, exchanges a consent code and refreshes restored credentials", () => {
        cy.task("agentOAuthPkceAndRefresh").should("equal", true);
    });
    it("never refreshes one backend's credentials at another backend", () => {
        cy.task("agentOAuthIssuerIsolation").should("equal", true);
    });
    it("supports browser preflight and readable authorization challenges without credentialed CORS", () => {
        cy.task("agentOAuthBrowserDiscovery").should("equal", true);
    });
});
