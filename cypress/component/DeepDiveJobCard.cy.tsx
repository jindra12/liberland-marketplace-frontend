import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    screenshotStep,
    waitForCollectionQuery,
} from "../support/component-tests/utils";

describe("job card", () => {
    const loadJobCard = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL]);
    };

    it("shows employment type, salary, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadJobCard();

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Jobs",
            "Dockmaster",
        );
        cy.get(".SplashEntityCard--jobs", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Dockmaster").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Harbor Operator").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Harbor Analyst").should("be.visible");
            cy.contains(".SplashEntityCard__meta", "Full-time").should("be.visible");
            cy.contains(".SplashEntityCard__meta", "USD 3,200 – 4,000").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
            cy.get(".SplashEntityCard__inlineActions").should("be.visible");
            cy.get(".NativeShareButton").should("be.visible");
        });
    });
});
