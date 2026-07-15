import { COOP_SERVER_URL, GUEST_SERVER_URL, detailRoute, editRoute } from "../support/component-tests/constants";
import { mountMainRoute, waitForDetailQuery } from "../support/component-tests/utils";

const guardedRoutes = [
    detailRoute("/jobs", "guarded-job", GUEST_SERVER_URL),
    detailRoute("/companies", "guarded-company", GUEST_SERVER_URL),
    detailRoute("/tribes", "guarded-identity", GUEST_SERVER_URL),
    detailRoute("/products-services", "guarded-product", GUEST_SERVER_URL),
    detailRoute("/posts", "guarded-post", GUEST_SERVER_URL),
    detailRoute("/comments", "guarded-comment", GUEST_SERVER_URL),
    detailRoute("/ventures", "guarded-startup", GUEST_SERVER_URL),
    editRoute("/jobs", "guarded-job", GUEST_SERVER_URL),
    editRoute("/companies", "guarded-company", GUEST_SERVER_URL),
    editRoute("/products-services", "guarded-product", GUEST_SERVER_URL),
    editRoute("/posts", "guarded-post", GUEST_SERVER_URL),
    editRoute("/ventures", "guarded-startup", GUEST_SERVER_URL),
];

describe("syndication guard test", () => {
    it("guards all edit and detail routes except syndication detail", () => {
        mountMainRoute("/");

        guardedRoutes.forEach((route) => {
            cy.routerNavigate(route);
            cy.get(".ServerUrlGuard__content").should("be.visible");
            cy.contains(".ServerUrlGuard__copy", GUEST_SERVER_URL).should("be.visible");
            cy.contains("Enable content from this server").should("be.visible");
            cy.contains("button", "Yes").should("be.visible");
            cy.contains("button", "No").should("be.visible");
            cy.contains("button", "No").click();
            cy.location("pathname").should("eq", "/");
        });
    });

    it("lets a detail page through after trusting the server", () => {
        mountMainRoute(detailRoute("/jobs", "coop-job-dock-foreman", COOP_SERVER_URL));
        cy.get(".ServerUrlGuard__content").should("be.visible");
        cy.contains("Enable content from this server").click();
        cy.contains("button", "Yes").click();

        waitForDetailQuery(
            COOP_SERVER_URL,
            "JobById",
            { id: "coop-job-dock-foreman" },
            "Job",
            "coop-job-dock-foreman",
            "Dock Foreman",
        );
        cy.get(".JobDetail").should("be.visible");
    });

    it("returns home when the user rejects an edit page", () => {
        mountMainRoute(editRoute("/companies", "guarded-company", GUEST_SERVER_URL));
        cy.contains("Trust this server?").should("be.visible");
        cy.contains("button", "No").click();
        cy.location("pathname").should("eq", "/");
        cy.get(".SplashPage").should("be.visible");
    });
});
