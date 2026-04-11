import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, waitForCollectionQuery, waitForDetailQuery, waitForRouteLoad } from "../support/component-tests/utils";

describe("identity deep dive", () => {
    beforeEach(() => {
        mountMainRoute("/tribes/identity-nova");
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "IdentityById",
            { id: "identity-nova" },
            "Identity",
            "identity-nova",
            "Nova Rivers",
        );
    });

    it("shows the company list and related market cards", () => {
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Companies",
            "Harbor Labs",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Jobs",
            "Dockmaster",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Products",
            "Solar Widget",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Startups",
            "Sky Relay",
        );

        cy.get(".IdentityDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.get(".SplashEntityCard--companies").should("be.visible").contains("Harbor Labs");
        cy.get(".SplashEntityCard--jobs").should("be.visible").contains("Dockmaster");
        cy.get(".SplashEntityCard--products").should("be.visible").contains("Solar Widget");
        cy.get(".SplashEntityCard--ventures").should("be.visible").contains("Sky Relay");
        cy.get(".ShareSection").should("be.visible").contains("Share this tribe");
    });
});
