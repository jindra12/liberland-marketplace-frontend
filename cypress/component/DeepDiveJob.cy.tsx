import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, waitForCollectionQuery, waitForDetailQuery, waitForRouteLoad } from "../support/component-tests/utils";

describe("job deep dive", () => {
    beforeEach(() => {
        mountMainRoute("/jobs/job-dockmaster");
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(MAIN_SERVER_URL, "JobById", { id: "job-dockmaster" }, "Job", "job-dockmaster", "Dockmaster");
    });

    it("shows the salary tag, company metadata, and comments", () => {
        cy.get(".JobDetail").should("be.visible");
        cy.contains(".JobDetail__title", "Dockmaster").should("be.visible");
        cy.get(".JobDetail__summary").contains("Harbor Labs").should("be.visible");
        cy.get(".JobDetail__summary").contains("Harbor City").should("be.visible");
        cy.get(".JobDetail__summary").contains("2 positions").should("be.visible");
        cy.get(".JobDetail__summary").contains("USD 3,200 – 4,000").should("be.visible");
        cy.get(".ShareSection").should("be.visible").contains("Share this job");
        cy.get(".JobDetail__identityRow").should("be.visible");

        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 20,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Jobs],
                targetId: "job-dockmaster",
                url: MAIN_SERVER_URL,
            },
            "Comments",
            "Harbor Labs has strong logistics.",
        );
        cy.contains(".EntityCommentsSection", "Harbor Labs has strong logistics.").should("be.visible");
    });
});
