describe("syndicated sitemap gateway", () => {
    it("combines cached backend manifests without database scans or nested indexes", () => {
        cy.task("sitemapAggregation").should("equal", true);
    });
    it("proxies cached shards onto this frontend and preserves backend ownership and dates", () => {
        cy.task("sitemapProxy").should("equal", true);
    });
    it("reports unavailable, mismatched and corrupted backend snapshots instead of fake empty sitemaps", () => {
        cy.task("sitemapFailures").should("equal", true);
    });
    it("enforces sitemap size limits, validates filenames and escapes XML correctly", () => {
        cy.task("sitemapBoundaries").should("equal", true);
    });
});
