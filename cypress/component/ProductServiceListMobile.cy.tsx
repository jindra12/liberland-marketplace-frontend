import { MAIN_SERVER_URL, LIST_GOALS } from "../support/component-tests/constants";
import { mountMainRoute, waitForCollectionQuery, waitForPageShell } from "../support/component-tests/utils";

describe("product/service list mobile", () => {
    it("stacks the share controls below the small breakpoint", () => {
        const marketGoal = LIST_GOALS.find((goal) => goal.trigger === "Market");
        if (marketGoal === undefined) {
            throw new Error("Missing Market list goal");
        }

        cy.viewport(575, 1200);
        mountMainRoute(marketGoal.route);
        waitForPageShell();
        waitForCollectionQuery(MAIN_SERVER_URL, "ListProducts", { limit: 20, page: 1 }, "Products", "Solar Widget");
        cy.contains("h2", marketGoal.title).should("be.visible");

        cy.get(".ProductList__actionsRow")
            .first()
            .should("be.visible")
            .within(() => {
                cy.get(".ListShareDetailButtons--stacked").should("be.visible");
                cy.get(".ListShareDetailButtons--stacked .ant-btn").should("have.length", 3);
                cy.get(".ListShareDetailButtons--compact").should("not.exist");
            });
    });
});
