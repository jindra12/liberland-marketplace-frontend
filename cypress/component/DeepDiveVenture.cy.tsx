import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, waitForCollectionQuery, waitForDetailQuery, waitForRouteLoad } from "../support/component-tests/utils";

describe("venture deep dive", () => {
    beforeEach(() => {
        mountMainRoute("/ventures/startup-sky-relay");
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "StartupById",
            { id: "startup-sky-relay" },
            "Startup",
            "startup-sky-relay",
            "Sky Relay",
        );
    });

    it("shows the venture details, resources, and discussion", () => {
        cy.get(".StartupDetail").should("be.visible");
        cy.contains(".StartupDetail__eyebrow", "Venture").should("be.visible");
        cy.contains(".StartupDetail__title", "Sky Relay").should("be.visible");
        cy.contains(".StartupDetail__badgeRow", "MVP").should("be.visible");
        cy.contains(".StartupDetail__summary", "Harbor Labs").should("be.visible");
        cy.get(".StartupDetail__section--resources").within(() => {
            cy.contains("Looking for").should("be.visible");
            cy.contains("Founders").should("be.visible");
            cy.contains("Already have").should("be.visible");
            cy.contains("Product").should("be.visible");
            cy.contains("Distribution").should("be.visible");
        });
        cy.get(".ShareSection").should("be.visible").contains("Share this venture");
        cy.get(".StartupDetail__tabs").contains("Team (2)").should("be.visible");

        cy.contains(".StartupDetail__tabs .ant-tabs-tab", "Discussion").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 100,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Startups],
                targetId: "startup-sky-relay",
            },
            "Comments",
            "Sky Relay could use more testers.",
        );
        cy.contains(".EntityCommentsSection", "Sky Relay could use more testers.").should("be.visible");
    });
});
