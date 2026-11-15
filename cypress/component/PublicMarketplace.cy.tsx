describe("Public GET marketplace tools", () => {
    it("lists and searches source-qualified records across backends with continuation links", () => {
        cy.task("publicMarketplaceListings").should("equal", true);
    });
    it("retrieves details, related records and product comparisons without MCP response envelopes", () => {
        cy.task("publicMarketplaceDetails").should("equal", true);
    });
    it("describes backend schemas and discovers a cyclic syndication directory without writes", () => {
        cy.task("publicMarketplaceDiscovery").should("equal", true);
    });
    it("rejects private records, writes and unsafe input while retaining healthy backend results", () => {
        cy.task("publicMarketplaceIsolation").should("equal", true);
    });
    it("serves ordinary HTTP JSON without browser JavaScript or authentication", () => {
        cy.task("publicMarketplaceHttp").should("equal", true);
    });
});
