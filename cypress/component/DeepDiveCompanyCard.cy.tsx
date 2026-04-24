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

        cy.get(".IdentityDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click({ force: true });
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Companies",
            "Harbor Labs",
        );
        cy.contains(".ant-list-item-meta-title", "Harbor Labs").should("be.visible");
        cy.contains(".CompanyList__contacts", "Website").should("be.visible");
        cy.get(".LikeButton").should("be.visible");
        cy.get(".NativeShareButton").should("be.visible");
        screenshotStep("company-card-desktop");
    });

    it("shows the company card on mobile", () => {
        cy.viewport(390, 844);
        loadCompanyCard();

        cy.get(".IdentityDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Companies").click();
        cy.contains(".ant-list-item-meta-title", "Harbor Labs", { timeout: 20000 }).should("be.visible");
        cy.get(".LikeButton").should("be.visible");
        screenshotStep("company-card-mobile");
    });
});
