import { COOP_SERVER_URL, detailRoute, MAIN_SERVER_URL, syndicationDetailRoute } from "../support/component-tests/constants";
import { mountAnonymousRoute, seedNsfwConsent, waitForCollectionQuery } from "../support/component-tests/utils";

describe("identity deep dive", () => {
    beforeEach(() => {
        mountAnonymousRoute(detailRoute("/tribes", "identity-nova"), [MAIN_SERVER_URL], undefined, seedNsfwConsent);
    });

    it("shows the tabs and related market cards", () => {
        cy.get(".IdentityDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.contains(".IdentityDetail__syndicationLink", "Open syndication source").should("not.exist");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Products",
            "Solar Widget",
        );
        cy.contains(".ant-list-item-meta-title", "Solar Widget").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Jobs",
            "Dockmaster",
        );
        cy.contains(".ant-list-item-meta-title", "Dockmaster").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Companies",
            "Harbor Labs",
        );
        cy.contains(".ant-list-item-meta-title", "Harbor Labs").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Startups",
            "Sky Relay",
        );
        cy.contains(".ant-list-item-meta-title", "Sky Relay").should("be.visible");
        cy.get(".LikeButton").should("have.length.at.least", 4);
        cy.get(".ShareSection").should("be.visible");
        cy.contains(".ShareSection", "Share this tribe").should("not.exist");
    });

    it("links back to the syndication detail when multiple servers are enabled", () => {
        mountAnonymousRoute(detailRoute("/tribes", "identity-nova"), [MAIN_SERVER_URL, COOP_SERVER_URL], undefined, seedNsfwConsent);

        cy.get(".IdentityDetail__syndicationLink")
            .should("be.visible")
            .and("have.attr", "href", syndicationDetailRoute(MAIN_SERVER_URL));
    });
});
