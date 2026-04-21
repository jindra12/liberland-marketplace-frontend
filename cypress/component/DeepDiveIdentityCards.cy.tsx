import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    screenshotStep,
    waitForCollectionQuery,
} from "../support/component-tests/utils";

describe("identity tabs", () => {
    const loadIdentityTabs = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL]);
    };

    it("shows tabs and desktop cards", () => {
        cy.viewport(1440, 1200);
        loadIdentityTabs();

        cy.get(".EntityDetail__tabs", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").should("be.visible").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7, url: MAIN_SERVER_URL },
            "Products",
            "Solar Widget",
        );
        cy.contains(".ant-list-item-meta-title", "Solar Widget").should("be.visible");
        cy.contains(".ant-list-item-meta-title", "Sun Panel").should("be.visible");
        cy.contains(".ant-list-item-meta-title", "River Beacon").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7, url: MAIN_SERVER_URL },
            "Jobs",
            "Dockmaster",
        );
        cy.contains(".ant-list-item-meta-title", "Dockmaster").should("be.visible");
        cy.get(".LikeButton").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7, url: MAIN_SERVER_URL },
            "Companies",
            "Harbor Labs",
        );
        cy.contains(".ant-list-item-meta-title", "Harbor Labs").should("be.visible");
        cy.contains(".ant-list-item-meta-title", "Reef Studio").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7, url: MAIN_SERVER_URL },
            "Startups",
            "Sky Relay",
        );
        cy.contains(".ant-list-item-meta-title", "Sky Relay").should("be.visible");

        screenshotStep("identity-tabs-desktop");
    });

    it("shows tabs and mobile cards", () => {
        cy.viewport(390, 844);
        loadIdentityTabs();

        cy.get(".EntityDetail__tabs", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").click();
        cy.contains(".ant-list-item-meta-title", "Solar Widget").should("be.visible");
        cy.get(".LikeButton").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        cy.contains(".ant-list-item-meta-title", "Harbor Labs").should("be.visible");
        cy.get(".LikeButton").should("be.visible");

        screenshotStep("identity-tabs-mobile");
    });
});
