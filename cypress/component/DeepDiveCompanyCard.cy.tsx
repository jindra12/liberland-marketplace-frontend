import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    screenshotStep,
    waitForCollectionQuery,
} from "../support/component-tests/utils";

describe("company card", () => {
    const loadCompanyCard = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL]);
    };

    it("shows title, avatar, website, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadCompanyCard();

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Companies",
            "Harbor Labs",
        );
        cy.get(".SplashEntityCard--companies", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Harbor Labs").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Reef Studio").should("be.visible");
            cy.contains(".SplashEntityCard__meta a", "Website").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
            cy.get(".SplashEntityCard__inlineActions").should("be.visible");
            cy.get(".NativeShareButton").should("be.visible");
        });
        screenshotStep("company-card-desktop");
    });

    it("shows the company card on mobile", () => {
        cy.viewport(390, 844);
        loadCompanyCard();

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Companies",
            "Harbor Labs",
        );
        cy.get(".SplashEntityCard--companies", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Harbor Labs").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });
        screenshotStep("company-card-mobile");
    });
});
