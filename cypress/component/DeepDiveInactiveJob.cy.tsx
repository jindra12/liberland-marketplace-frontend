import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, waitForDetailQuery } from "../support/component-tests/utils";

describe("inactive job", () => {
    it("shows the inactive title state and notice", () => {
        mountMainRoute(detailRoute("/jobs", "job-harbor-watch"));
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "JobById",
            { id: "job-harbor-watch" },
            "Job",
            "job-harbor-watch",
            "Harbor Watch",
        );

        cy.get(".JobDetail__title del").should("contain", "Harbor Watch");
        cy.get(".JobInactiveNotice").should("be.visible").contains("no longer active");
        cy.get(".JobDetail__summary").contains("USD 2,600 – 3,100").should("be.visible");
    });
});
