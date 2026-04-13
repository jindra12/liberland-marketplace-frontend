import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, waitForCollectionQuery } from "../support/component-tests/utils";

describe("identity deep dive", () => {
    beforeEach(() => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL]);
    });

    it("shows the tabs and related market cards", () => {
        cy.get(".IdentityDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Products",
            "Solar Widget",
        );
        cy.get(".SplashEntityCard--products").should("be.visible").contains("Solar Widget");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Jobs",
            "Dockmaster",
        );
        cy.get(".SplashEntityCard--jobs").should("be.visible").contains("Dockmaster");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Companies",
            "Harbor Labs",
        );
        cy.get(".SplashEntityCard--companies").should("be.visible").contains("Harbor Labs");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Startups",
            "Sky Relay",
        );
        cy.get(".SplashEntityCard--ventures").should("be.visible").contains("Sky Relay");
        cy.get(".LikeButton").should("have.length.at.least", 4);
        cy.get(".ShareSection").should("be.visible").contains("Share this tribe");
    });
});
