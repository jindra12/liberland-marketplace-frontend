import { MAIN_SERVER_URL, detailRoute } from "../support/component-tests/constants";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import {
    mountAuthenticatedDetailRoute,
    screenshotStep,
    waitForDetailQuery,
} from "../support/component-tests/utils";

type DetailEditButtonGoal = {
    operationName: "CompanyById" | "JobById" | "PostById" | "ProductById" | "StartupById";
    route: string;
    title: string;
    variables: { id: string };
};

const detailEditButtonGoals: DetailEditButtonGoal[] = [
    {
        operationName: "ProductById",
        route: detailRoute("/products-services", "product-moon-lamp"),
        title: "Moon Lamp",
        variables: { id: "product-moon-lamp" },
    },
    {
        operationName: "CompanyById",
        route: detailRoute("/companies", "company-harbor-labs"),
        title: "Harbor Labs",
        variables: { id: "company-harbor-labs" },
    },
    {
        operationName: "JobById",
        route: detailRoute("/jobs", "job-dockmaster"),
        title: "Dockmaster",
        variables: { id: "job-dockmaster" },
    },
    {
        operationName: "PostById",
        route: detailRoute("/posts", "post-harbor-operations-digest"),
        title: "Harbor Operations Digest",
        variables: { id: "post-harbor-operations-digest" },
    },
    {
        operationName: "StartupById",
        route: detailRoute("/ventures", "startup-sky-relay"),
        title: "Sky Relay",
        variables: { id: "startup-sky-relay" },
    },
];

const assertEditButtonIsCompact = () => {
    cy.get(".EntityDetail__editButton", { timeout: 20000 })
        .should("be.visible")
        .should("contain.text", "Edit")
        .then(($button) => {
            const buttonRect = $button[0].getBoundingClientRect();
            const parentRect = $button[0].parentElement?.getBoundingClientRect();

            expect(parentRect).to.exist;
            expect(buttonRect.width).to.be.lessThan(parentRect?.width ?? 0);
        });
};

const openDetailPage = (goal: DetailEditButtonGoal) => {
    mountAuthenticatedDetailRoute(goal.route, [MAIN_SERVER_URL], undefined, true, (win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
    waitForDetailQuery(MAIN_SERVER_URL, goal.operationName, goal.variables, goal.operationName.replace("ById", ""), goal.variables.id, goal.title);
    assertEditButtonIsCompact();
    screenshotStep(`detail-edit-button-${goal.operationName}-${goal.title}`);
};

describe("detail edit buttons", () => {
    it("stay compact on desktop", () => {
        cy.viewport(1200, 1200);

        detailEditButtonGoals.forEach((goal) => {
            openDetailPage(goal);
        });
    });

    it("stay compact on mobile", () => {
        cy.viewport(390, 844);

        detailEditButtonGoals.forEach((goal) => {
            openDetailPage(goal);
        });
    });
});
