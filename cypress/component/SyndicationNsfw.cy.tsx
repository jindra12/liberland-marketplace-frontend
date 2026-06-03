import { mount } from "cypress/react";

import Main from "../../src/Main";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import type { URL as EndpointURL } from "../../src/types";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";

const buildEndpointUrls = (overrides: EndpointURL[]): EndpointURL[] => {
    return overrides;
};

const mountRouteWithEndpoints = (route: string, urls: EndpointURL[]) => {
    cy.window().then((win) => {
        win.localStorage.removeItem(NSFW_CONSENT_STORAGE_KEY);
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(urls)));
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

const getConsentValue = () => {
    return cy.window().then((win) => {
        return win.localStorage.getItem(NSFW_CONSENT_STORAGE_KEY);
    });
};

describe("syndication nsfw modal", () => {
    it("asks for 18+ consent and stores the marker when the user continues", () => {
        mountRouteWithEndpoints("/", [
            {
                enabled: true,
                value: MAIN_SERVER_URL,
                name: "Main",
                nsfw: true,
            },
        ]);

        cy.contains(".SyndicationNsfwModal", "18+ content", { timeout: 20000 }).should("be.visible");
        cy.contains(".SyndicationNsfwModal button", "Continue to site").click();
        getConsentValue().should("eq", "true");
        cy.contains(".SyndicationNsfwModal").should("not.exist");
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

        cy.contains(".SyndicationNsfwModal", "18+ content", { timeout: 20000 }).should("be.visible");
        cy.contains(".SyndicationNsfwModal button", "Disable NSFW servers").click();
        cy.contains(".SyndicationNsfwModal").should("not.exist");

        cy.window().then((win) => {
            const storedUrls = JSON.parse(win.localStorage.getItem("endpoints.urls") ?? "[]") as EndpointURL[];
            expect(storedUrls.some((entry) => entry.enabled && entry.nsfw)).to.eq(false);
            expect(storedUrls.some((entry) => entry.nsfw)).to.eq(true);
        });
    });

    it("stores the marker when the user manually enables an nsfw server", () => {
        mountRouteWithEndpoints("/syndication", [
            {
                enabled: false,
                value: MAIN_SERVER_URL,
                name: "Main",
                nsfw: true,
            },
        ]);

        cy.contains("button", "Enable").first().click();

        getConsentValue().should("eq", "true");
        cy.contains(".SyndicationNsfwModal").should("not.exist");
    });
});
