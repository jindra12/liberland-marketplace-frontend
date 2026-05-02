import { UserManager } from "oidc-client-ts";
import type { SinonStub } from "sinon";

import { detailRoute, COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, mountAuthenticatedDetailRoute, screenshotStep, waitForDetailQuery } from "../support/component-tests/utils";
import { buildGraphQLAlias } from "../support/graphqlMock/alias";
import { activeFixtures, addReportedLinkForHost, graphQLFixturesForHost } from "../support/graphqlMock/runtimeState";

const REPORT_ROUTE = detailRoute("/jobs", "coop-job-dock-foreman", COOP_SERVER_URL);
const REPORT_REASON = "The content should be reviewed.";
const CREATE_REPORT_VARIABLES = {
    data: {
        contentLink: REPORT_ROUTE,
        reason: REPORT_REASON,
        userId: "user-nova",
        createdBy: "user-nova",
    },
};
const ME_USER_ALIAS = buildGraphQLAlias(COOP_SERVER_URL, "MeUser", { url: COOP_SERVER_URL });
const CREATE_REPORT_ALIAS = buildGraphQLAlias(COOP_SERVER_URL, "CreateReport", CREATE_REPORT_VARIABLES);

type MeUserResponse = {
    data?: {
        meUser?: {
            user?: {
                reportedLinks?: string[] | null;
            } | null;
        } | null;
    };
};

const VIEWPORTS = {
    desktop: { width: 1440, height: 1200 },
    mobile: { width: 390, height: 844 },
} as const;
const COOP_GRAPHQL_HOST = new URL(COOP_SERVER_URL).host;

const waitForMeUserReportedLinks = (expectedReportedLinks: string[]) => {
    cy.wait(`@${ME_USER_ALIAS}`, { timeout: 20000 }).then((interception) => {
        const response = interception.response?.body as MeUserResponse | undefined;

        expect(interception.request.url).to.equal(`${COOP_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(response?.data?.meUser?.user?.reportedLinks ?? []).to.deep.equal(expectedReportedLinks);
    });
};

const waitForMeUserRequest = () => {
    cy.wait(`@${ME_USER_ALIAS}`, { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${COOP_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });
};

const openReportModal = () => {
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .click();
    cy.contains(".ant-modal", "Report content", { timeout: 20000 }).should("be.visible");
};

const fillReportReasonAndSubmit = () => {
    cy.get(".ant-modal").within(() => {
        cy.get("textarea").should("be.visible").clear({ force: true }).type(REPORT_REASON, { force: true });
        cy.contains("button", "Report").should("be.visible").click();
    });
};

const runAuthenticatedDesktopFlow = () => {
    cy.viewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
    cy.resetQL();
    cy.clearLocalStorage();
    graphQLFixturesForHost(COOP_GRAPHQL_HOST);
    activeFixtures.meUser.user.reportedLinks = [];
    mountAuthenticatedDetailRoute(REPORT_ROUTE, [COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    waitForMeUserRequest();
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("not.be.disabled");
    openReportModal();
    screenshotStep("report-submit-desktop-modal");
    fillReportReasonAndSubmit();
    cy.wait(`@${CREATE_REPORT_ALIAS}`, { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${COOP_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.request.body.variables).to.deep.equal(CREATE_REPORT_VARIABLES);
    });
    waitForMeUserReportedLinks([REPORT_ROUTE]);
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.disabled");
    screenshotStep("report-submit-desktop-disabled-after-submit");
};

const runAuthenticatedMobileFlow = () => {
    cy.viewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
    cy.resetQL();
    cy.clearLocalStorage();
    graphQLFixturesForHost(COOP_GRAPHQL_HOST);
    activeFixtures.meUser.user.reportedLinks = [];
    mountAuthenticatedDetailRoute(REPORT_ROUTE, [COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    waitForMeUserRequest();
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("not.be.disabled");
    openReportModal();
    screenshotStep("report-submit-mobile-modal");
    fillReportReasonAndSubmit();
    cy.wait(`@${CREATE_REPORT_ALIAS}`, { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${COOP_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.request.body.variables).to.deep.equal(CREATE_REPORT_VARIABLES);
    });
    waitForMeUserReportedLinks([REPORT_ROUTE]);
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.disabled");
    screenshotStep("report-submit-mobile-disabled-after-submit");
};

const runDisabledDesktopFlow = () => {
    cy.viewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
    cy.resetQL();
    cy.clearLocalStorage();
    cy.then(() => {
        graphQLFixturesForHost(COOP_GRAPHQL_HOST);
        activeFixtures.meUser.user.reportedLinks = [];
        addReportedLinkForHost(COOP_GRAPHQL_HOST, REPORT_ROUTE);
    });
    mountAuthenticatedDetailRoute(REPORT_ROUTE, [COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    waitForMeUserReportedLinks([REPORT_ROUTE]);
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("be.disabled");
    screenshotStep("report-disabled-desktop");
};

const runDisabledMobileFlow = () => {
    cy.viewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
    cy.resetQL();
    cy.clearLocalStorage();
    cy.then(() => {
        graphQLFixturesForHost(COOP_GRAPHQL_HOST);
        activeFixtures.meUser.user.reportedLinks = [];
        addReportedLinkForHost(COOP_GRAPHQL_HOST, REPORT_ROUTE);
    });
    mountAuthenticatedDetailRoute(REPORT_ROUTE, [COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    waitForMeUserReportedLinks([REPORT_ROUTE]);
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("be.disabled");
    screenshotStep("report-disabled-mobile");
};

const runAnonymousDesktopFlow = (signinRedirect: SinonStub) => {
    cy.viewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
    cy.resetQL();
    cy.clearLocalStorage();
    mountAnonymousRoute(REPORT_ROUTE, [MAIN_SERVER_URL, COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("not.be.disabled");
    screenshotStep("report-anonymous-desktop-button");
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .click();
    cy.wrap(signinRedirect).should("have.been.calledOnce");
    cy.get(".ant-modal").should("not.exist");
};

const runAnonymousMobileFlow = (signinRedirect: SinonStub) => {
    cy.viewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
    cy.resetQL();
    cy.clearLocalStorage();
    mountAnonymousRoute(REPORT_ROUTE, [MAIN_SERVER_URL, COOP_SERVER_URL]);
    waitForDetailQuery(COOP_SERVER_URL, "JobById", { id: "coop-job-dock-foreman" }, "Job", "coop-job-dock-foreman", "Dock Foreman");
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .should("be.visible")
        .and("not.be.disabled");
    screenshotStep("report-anonymous-mobile-button");
    cy.get(".ShareSection", { timeout: 20000 })
        .find('button[aria-label="Report content"]')
        .click();
    cy.wrap(signinRedirect).should("have.been.calledOnce");
    cy.get(".ant-modal").should("not.exist");
};

describe("report action", () => {
    it("submits a report on desktop, refetches meUser from the right server, and disables the button after submission", () => {
        runAuthenticatedDesktopFlow();
    });

    it("submits a report on mobile, refetches meUser from the right server, and disables the button after submission", () => {
        runAuthenticatedMobileFlow();
    });

    it("stays disabled on desktop when the current content already appears in reportedLinks", () => {
        runDisabledDesktopFlow();
    });

    it("stays disabled on mobile when the current content already appears in reportedLinks", () => {
        runDisabledMobileFlow();
    });

    it("routes anonymous users on desktop to login on the correct server", () => {
        const signinRedirect = cy.stub(UserManager.prototype, "signinRedirect").resolves();

        runAnonymousDesktopFlow(signinRedirect);
    });

    it("routes anonymous users on mobile to login on the correct server", () => {
        const signinRedirect = cy.stub(UserManager.prototype, "signinRedirect").resolves();

        runAnonymousMobileFlow(signinRedirect);
    });
});
