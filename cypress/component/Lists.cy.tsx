import { mount } from "cypress/react";

import { Flex, Typography } from "antd";

import { LIST_GOALS, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    goToList,
    goToSyndicationList,
    homepageQueries,
    mountMainHome,
    mountMainRoute,
    screenshotStep,
    waitForPageShell,
    waitForSearchQuery,
    seedNsfwConsent,
} from "../support/component-tests/utils";
import { PostRepostLink } from "../../src/components/shared/post/PostRepostLink";

describe("lists", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        mountMainHome(seedNsfwConsent);
    });

    it("Fetches homepage queries", () => {
        homepageQueries();
    });

    LIST_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} list from home`, () => {
            goToList(goal);
        });
    });

    it("filters a list by tribe using autocomplete search", () => {
        const jobsGoal = LIST_GOALS.find((goal) => goal.trigger === "Jobs");
        if (jobsGoal === undefined) {
            throw new Error("Missing Jobs list goal");
        }

        goToList(jobsGoal);

        cy.get(".FilterControl .ant-select-selector").click();
        cy.get(".FilterControl .ant-select-selection-search-input").type("Nova Rivers", { force: true });
        waitForSearchQuery(MAIN_SERVER_URL, "SearchIdentities", "Nova Rivers", "Nova Rivers");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "Nova Rivers")
            .should("be.visible")
            .click({ force: true });
        cy.contains(".FilterControl .ant-select-selection-item", "Nova Rivers").should("be.visible");
    });

    it("opens the Syndication list from home", () => {
        goToSyndicationList();
    });

    it("adds a product to cart from the market list", () => {
        const marketGoal = LIST_GOALS.find((goal) => goal.trigger === "Market");
        if (marketGoal === undefined) {
            throw new Error("Missing Market list goal");
        }

        cy.intercept("POST", "**/api/graphql", (req) => {
            if (JSON.stringify(req.body).includes("CreateCart")) {
                req.alias = "createCart";
            }
        });
        goToList(marketGoal);

        cy.get(".ProductList__actionsRow")
            .first()
            .should("be.visible")
            .within(() => {
                cy.get('button[aria-label="Add to cart"]').should("be.visible").click();
            });
        cy.wait("@createCart").its("response.statusCode").should("eq", 200);

        screenshotStep("list-market-add-to-cart");
    });

    it("shows the original post link for reposted posts in the list UI", () => {
        mount(
            <Flex vertical gap={4} className="PostList__meta">
                <Typography.Title level={2}>Harbor Launch Notes</Typography.Title>
                <PostRepostLink repost="https://example.test/original/harbor-launch-notes" />
            </Flex>,
        );

        cy.get(".PostRepostLink__icon").should("be.visible");
        cy.contains(".PostRepostLink", "Original post").should("be.visible");
        cy.contains(".PostRepostLink", "Original post").should(
            "have.attr",
            "href",
            "https://example.test/original/harbor-launch-notes",
        );
        screenshotStep("homepage-post-repost-link");
    });

    it("shows post content in the posts list preview", () => {
        const postsGoal = LIST_GOALS.find((goal) => goal.trigger === "Posts");
        if (postsGoal === undefined) {
            throw new Error("Missing Posts list goal");
        }

        goToList(postsGoal);

        cy.contains(".PostList__description", "Harbor operations improved this week with tighter handoffs and clearer status updates.")
            .scrollIntoView()
            .should("be.visible")
            .and("have.class", "Markdown--clamp2");
        cy.contains(".PostList__description", "Weekly harbor operations update").should("not.exist");
        cy.get(".PostList__meta").first().children().should("have.length.at.least", 3);
        cy.get(".PostList__meta")
            .first()
            .children()
            .then(($children) => {
                expect($children.eq(0)).to.have.class("PostList__description");
                expect($children.eq(1)).to.have.class("PostList__companyTag");
                expect($children.eq(2)).to.have.class("PostList__repostLink");
            });
        cy.get(".PostList__repostLink").first().should("be.visible");
        screenshotStep("list-post-content-preview");
    });
});
