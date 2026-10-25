describe("public tribe discovery", () => {
    it("reuses generated affiliation queries and preserves filters throughout JSON-LD pagination", () => {
        cy.task("tribeSearchGraphql").should("equal", true);
    });

    it("rejects ambiguous, missing, invalid, and private-source lookups without leaking unfiltered listings", () => {
        cy.task("tribeSearchSafety").should("equal", true);
    });

    it("advertises public GET search and complete collections through home, listing, and tribe metadata", () => {
        cy.task("tribeSearchDiscovery").should("equal", true);
    });

    it("supports anonymous MCP affiliation search through backend MCPs for all three entities", () => {
        cy.task("tribeSearchMcp").should("equal", true);
    });
});
