import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAuthenticatedRoute, screenshotStep, waitForDetailQuery } from "../support/component-tests/utils";
import { activeFixtures } from "../support/graphqlMock/runtimeState";

const assertTeamButton = (label: string) => {
    cy.contains(".StartupDetail__joinAction button", label).should("be.visible");
};

const assertTeamCount = (count: number) => {
    cy.contains(".EntityDetail__tabs .ant-tabs-tab", `Team (${count})`).should("be.visible");
};

const mountStartupDetail = (route: string, startupId: string, title: string) => {
    const startup = activeFixtures.startups.find((item) => item.id === startupId);
    const currentUser = activeFixtures.meUser.user;

    if (startup && currentUser) {
        startup.involvedUsers = [
            {
                ...currentUser,
                id: "startup-peer-member",
                name: "Peer Member",
                email: "peer.member@example.test",
            },
        ];
    }

    mountAuthenticatedRoute(route, [MAIN_SERVER_URL]);
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
        mountStartupDetail("/ventures/startup-sky-relay", "startup-sky-relay", "Sky Relay");

        assertTeamButton("Get Involved");
        assertTeamCount(1);

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
        assertTeamCount(2);
        screenshotStep("startup-joined");
    });

    it("leaves a startup and refreshes the team state without a page reload", () => {
        mountStartupDetail("/ventures/startup-sky-relay", "startup-sky-relay", "Sky Relay");

        assertTeamButton("Get Involved");
        assertTeamCount(1);

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
        assertTeamCount(2);
        screenshotStep("startup-joined-before-leave");

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
        assertTeamCount(1);
        screenshotStep("startup-left");
    });
});
