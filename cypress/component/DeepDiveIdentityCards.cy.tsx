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

        cy.get(".IdentityDetail__tabs", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").should("be.visible").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Products",
            "Solar Widget",
        );
        cy.get(".SplashEntityCard--products").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Solar Widget").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Sun Panel").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "River Beacon").should("be.visible");
        });

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Jobs",
            "Dockmaster",
        );
        cy.get(".SplashEntityCard--jobs").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Dockmaster").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Companies",
            "Harbor Labs",
        );
        cy.get(".SplashEntityCard--companies").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Harbor Labs").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Reef Studio").should("be.visible");
        });

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Startups",
            "Sky Relay",
        );
        cy.get(".SplashEntityCard--ventures").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Sky Relay").should("be.visible");
        });

        screenshotStep("identity-tabs-desktop");
    });

    it("shows tabs and mobile cards", () => {
        cy.viewport(390, 844);
        loadIdentityTabs();

        cy.get(".IdentityDetail__tabs", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Products",
            "Solar Widget",
        );
        cy.get(".SplashEntityCard--products").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Solar Widget").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Companies",
            "Harbor Labs",
        );
        cy.get(".SplashEntityCard--companies").should("be.visible").within(() => {
            cy.contains(".SplashEntityCard__itemLink", "Harbor Labs").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });

        screenshotStep("identity-tabs-mobile");
    });
});
