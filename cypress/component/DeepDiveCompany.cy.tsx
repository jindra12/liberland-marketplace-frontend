import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountMainRoute,
    waitForCollectionQuery,
    waitForDetailQuery,
} from "../support/component-tests/utils";

describe("company deep dive", () => {
    beforeEach(() => {
        mountMainRoute(detailRoute("/companies", "company-harbor-labs"));
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );
    });

    it("shows company content, tabs, and comments", () => {
        cy.get(".CompanyDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Harbor Labs").should("be.visible");
        cy.contains(".CompanyVerificationTag", "trader").should("be.visible");
        cy.contains(".Markdown", "Distributed shipping and tooling").should("be.visible");
        cy.get(".CompanyContactLinks").should("be.visible").contains("hello@harbor.example");
        cy.get(".ShareSection").should("be.visible");
        cy.contains(".ShareSection", "Share this company").should("not.exist");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".CompanyDetail__identityRow").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Jobs").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Jobs",
            "Dockmaster",
        );
        cy.contains(".JobList__body", "Coordinate shipping and fulfilment").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products / Services").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Products",
            "Solar Widget",
        );
        cy.contains(".EntityList__description", "Unlimited utility hardware").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Startups",
            "Sky Relay",
        );
        cy.contains(".EntityList__description", "Relay beacons for the marketplace").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Discussion").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 20,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies],
                targetId: "company-harbor-labs",
                url: MAIN_SERVER_URL,
            },
            "Comments",
            "Harbor Labs has strong logistics.",
        );
        cy.contains(".EntityCommentsSection", "Harbor Labs has strong logistics.").should("be.visible");
    });
});
