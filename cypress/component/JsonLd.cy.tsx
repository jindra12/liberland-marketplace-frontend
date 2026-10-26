describe("standalone JSON-LD and linked entities", () => {
    it("advertises the alternate document and serves the same graph without HTML or JavaScript", () => {
        cy.task("jsonLdAlternatives").should("equal", true);
    });
    it("links companies, tribes, employers and sellers with stable backend-specific IDs", () => {
        cy.task("jsonLdRelationships").should("equal", true);
    });
    it("keeps prices, currencies and unknown availability accurate", () => {
        cy.task("jsonLdOfferAccuracy").should("equal", true);
    });
    it("includes explicit relationships in regular and tribe-filtered listing graphs", () => {
        cy.task("jsonLdListingRelationships").should("equal", true);
    });
    it("reuses generated GraphQL documents and source URLs for listing metadata", () => {
        cy.task("jsonLdGeneratedQueryReuse").should("equal", true);
    });
});
