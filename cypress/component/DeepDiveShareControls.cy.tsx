import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, waitForDetailQuery, waitForRouteLoad } from "../support/component-tests/utils";

describe("share controls", () => {
    it("uses the desktop share layout at 1200px and up", () => {
        cy.viewport(1200, 1200);
        mountMainRoute("/companies/company-harbor-labs");
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );

        cy.get(".ShareSection").should("be.visible");
        cy.get(".ShareSection--mobile").should("not.exist");
        cy.get(".ShareSection__actions").should("be.visible");
        cy.get(".ShareSection__buttons").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__nativeButton").should("be.visible");
    });

    it("uses the mobile share layout below 1200px", () => {
        cy.viewport(767, 1200);
        mountMainRoute("/companies/company-harbor-labs");
        cy.contains("h1", "Harbor Labs").should("be.visible");

        cy.get(".ShareSection--mobile").should("be.visible");
        cy.get(".ShareSection__mobileActions").should("be.visible");
        cy.get(".ShareSection__mobileButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__actions").should("not.exist");
        cy.get(".ShareSection__iconButton").should("not.exist");
    });
});
