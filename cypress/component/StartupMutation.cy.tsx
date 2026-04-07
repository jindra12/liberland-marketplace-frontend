import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAuthenticatedRoute, waitForDetailQuery } from "../support/component-tests/utils";

const assertTeamButton = (label: string) => {
    cy.contains(".StartupDetail__joinAction button", label).should("be.visible");
};

const assertTeamCount = (count: number) => {
    cy.contains(".StartupDetail__tabs .ant-tabs-tab", `Team (${count})`).should("be.visible");
};

const mountStartupDetail = (route: string, startupId: string, title: string) => {
    mountAuthenticatedRoute(route);
    waitForDetailQuery(
        MAIN_SERVER_URL,
        "StartupById",
        { id: startupId },
        "Startup",
        startupId,
        title,
    );
    cy.get(".StartupDetail").should("be.visible");
};

describe("startup mutations", () => {
    it("joins a startup and refreshes the team state without a page reload", () => {
        mountStartupDetail("/ventures/startup-tide-loop", "startup-tide-loop", "Tide Loop");

        assertTeamButton("Get Involved");
        assertTeamCount(2);

        cy.contains(".StartupDetail__joinAction button", "Get Involved").click();

        waitForDetailQuery(
            MAIN_SERVER_URL,
            "StartupById",
            { id: "startup-tide-loop" },
            "Startup",
            "startup-tide-loop",
            "Tide Loop",
        );

        assertTeamButton("Remove Involvement");
        assertTeamCount(3);
    });

    it("leaves a startup and refreshes the team state without a page reload", () => {
        mountStartupDetail("/ventures/startup-sky-relay", "startup-sky-relay", "Sky Relay");

        assertTeamButton("Get Involved");
        assertTeamCount(2);

        cy.contains(".StartupDetail__joinAction button", "Get Involved").click();

        waitForDetailQuery(
            MAIN_SERVER_URL,
            "StartupById",
            { id: "startup-sky-relay" },
            "Startup",
            "startup-sky-relay",
            "Sky Relay",
        );

        assertTeamButton("Remove Involvement");
        assertTeamCount(3);

        cy.contains(".StartupDetail__joinAction button", "Remove Involvement").click();

        waitForDetailQuery(
            MAIN_SERVER_URL,
            "StartupById",
            { id: "startup-sky-relay" },
            "Startup",
            "startup-sky-relay",
            "Sky Relay",
        );

        assertTeamButton("Get Involved");
        assertTeamCount(2);
    });
});
