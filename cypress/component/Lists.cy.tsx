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
} from "../support/component-tests/utils";
import { PostRepostLink } from "../../src/components/shared/post/PostRepostLink";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

const seedNsfwConsent = () => {
    cy.window().then((win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
};

describe("lists", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        seedNsfwConsent();
        mountMainHome();
    });

    it("Fetches homepage queries", () => {
        homepageQueries();
    });

    LIST_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} list from home`, () => {
            goToList(goal);
        });
    });

    it("opens the Jobs list from home on mobile", () => {
        cy.viewport(390, 844);
        const jobsGoal = LIST_GOALS.find((goal) => goal.trigger === "Jobs");
        if (jobsGoal === undefined) {
            throw new Error("Missing Jobs list goal");
        }

        mountMainRoute(jobsGoal.route);
        waitForPageShell();
        cy.contains("h2", jobsGoal.title, { timeout: 20000 }).should("be.visible");
        cy.get(".JobList__body").should("be.visible").contains("Coordinate shipping and fulfilment");
        cy.get(".LikeButton").should("exist");
        screenshotStep("list-Jobs-mobile");
    });

    it("filters a list by tribe using autocomplete search", () => {
        cy.contains(".AppHeader__menuLink", "Jobs").click();
        cy.contains("h2", "Jobs").should("be.visible");

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
        cy.contains(".ant-message-notice", "Added to cart", { timeout: 20000 }).should("be.visible");

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
});
