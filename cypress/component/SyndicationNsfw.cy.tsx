import { mount } from "cypress/react";

import Main from "../../src/Main";
import type { URL as EndpointURL } from "../../src/types";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { dismissNsfwModal } from "../support/component-tests/utils";
import { getGraphQLFixturesForHost } from "../support/graphqlMock/runtimeState";

const buildEndpointUrls = (overrides: EndpointURL[]): EndpointURL[] => {
    return overrides;
};

const mountRouteWithEndpoints = (route: string, urls: EndpointURL[]) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(urls)));
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

describe("syndication nsfw modal", () => {
    afterEach(() => {
        const mainSyndication = getGraphQLFixturesForHost(MAIN_SERVER_URL).syndications.find(
            (entry) => entry.url === MAIN_SERVER_URL,
        );
        if (mainSyndication !== undefined) {
            mainSyndication.nsfw = false;
        }
    });

    it("asks for 18+ consent and stores the marker when the user continues", () => {
        mountRouteWithEndpoints("/", [
            {
                enabled: true,
                value: MAIN_SERVER_URL,
                name: "Main",
                nsfw: true,
            },
        ]);

        cy.contains(".SyndicationNsfwModal", "18+ content").should("exist");
        dismissNsfwModal();
        cy.get(".SyndicationNsfwModal").should("not.be.visible");
    });

    it("disables all nsfw-marked servers when asked", () => {
        mountRouteWithEndpoints("/", [
            {
                enabled: true,
                value: MAIN_SERVER_URL,
                name: "Main",
                nsfw: true,
            },
        ]);

        cy.contains(".SyndicationNsfwModal", "18+ content").should("exist");
        dismissNsfwModal("disable");
        cy.get(".SyndicationNsfwModal").should("not.be.visible");

        cy.window().then((win) => {
            const storedUrls = JSON.parse(win.localStorage.getItem("endpoints.urls") ?? "[]") as EndpointURL[];
            expect(storedUrls.some((entry) => entry.enabled && entry.nsfw)).to.eq(false);
        });
    });

    it("stores the marker when the user manually enables an nsfw server", () => {
        const mainSyndication = getGraphQLFixturesForHost(MAIN_SERVER_URL).syndications.find(
            (entry) => entry.url === MAIN_SERVER_URL,
        );
        if (mainSyndication === undefined) {
            throw new Error("Missing main syndication fixture data");
        }
        mainSyndication.nsfw = true;

        mountRouteWithEndpoints("/syndication", [
            {
                enabled: false,
                value: MAIN_SERVER_URL,
                name: "Main",
            },
        ]);

        cy.contains(".ant-list-item a", /^Main$/).parents(".ant-list-item").within(() => {
            cy.contains("button", "Enable").click();
        });

        cy.get(".SyndicationNsfwModal").should("not.be.visible");
    });
});
