import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, waitForCollectionQuery, waitForDetailQuery } from "../support/component-tests/utils";

describe("identity deep dive", () => {
    beforeEach(() => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL, COOP_SERVER_URL]);
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
        cy.get(".LikeButton").should("have.length.at.least", 4);
        cy.get(".ShareSection").should("be.visible").contains("Share this tribe");
    });
});
