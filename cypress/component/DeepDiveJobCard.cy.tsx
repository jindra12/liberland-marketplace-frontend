import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    waitForCollectionQuery,
} from "../support/component-tests/utils";

describe("job card", () => {
    const loadJobCard = () => {
        mountAnonymousRoute(detailRoute("/tribes", "identity-nova"), [MAIN_SERVER_URL]);
    };

    it("shows employment type, salary, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadJobCard();

        cy.get(".IdentityDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click({ force: true });
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Jobs",
            "Dockmaster",
        );
        cy.contains(".ant-list-item-meta-title", "Dockmaster").should("be.visible");
        cy.contains(".JobList__body", "Full-time").should("be.visible");
        cy.contains(".JobList__body", "USD 3,200 – 4,000").should("be.visible");
        cy.get(".LikeButton").should("be.visible");
        cy.get(".NativeShareButton").should("be.visible");
    });
});
