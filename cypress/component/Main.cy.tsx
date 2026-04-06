import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";

type NavigationGoal = {
    route: string;
    title: string;
    trigger: string;
};

const mountHome = () => {
    mount(<Main />);
    cy.routerNavigate("/");
    cy.get(".LoadingSkeleton--boot").should("not.exist");
    cy.get(".SplashPage").should("be.visible");
};

const openDesktopMenu = () => {
    cy.get('button[aria-label="Open menu"]').click();
};

const openSearchScope = (scopeLabel: string) => {
    openDesktopMenu();
    cy.contains(".AppHeader__desktopDrawer button", "Search").click();
    cy.get(".SearchButton__menuOverlay").should("be.visible").contains(scopeLabel).click();
};

const waitForPageShell = (pageSkeletonSelector: string) => {
    cy.get(".LoadingSkeleton--surface").should("exist");
    cy.get(".LoadingSkeleton--surface").should("not.exist");
    cy.get(pageSkeletonSelector).should("exist");
    cy.get(pageSkeletonSelector).should("not.exist");
};

const goToList = (goal: NavigationGoal) => {
    cy.contains(".AppHeader__menuLink", goal.trigger).click();
    cy.location("pathname").should("eq", goal.route);
    waitForPageShell(".LoadingSkeleton--collection");
    cy.contains("h1", goal.title).should("be.visible");
};

const openDetailFromHome = (selector: string, label: string, route: string, title: string) => {
    cy.contains(selector, label).click();
    cy.location("pathname").should("eq", route);
    waitForPageShell(".LoadingSkeleton--detail");
    cy.contains("h1", title).should("be.visible");
};

const openDetailFromSearch = (
    scopeLabel: string,
    searchTitle: string,
    term: string,
    resultLabel: string,
    route: string,
    title: string,
) => {
    openSearchScope(scopeLabel);
    cy.contains("h2,h3", searchTitle).should("be.visible");
    cy.get('input[placeholder="Type to search"]').type(term);
    cy.get(".ant-select-item-option").contains(resultLabel).click();
    cy.location("pathname").should("eq", route);
    waitForPageShell(".LoadingSkeleton--detail");
    cy.contains("h1", title).should("be.visible");
};

describe("lists", () => {
    beforeEach(() => {
        mountHome();
    });

    [
        { trigger: "Jobs", route: "/jobs", title: "Jobs" },
        { trigger: "Market", route: "/products-services", title: "Products / Services" },
        { trigger: "Companies", route: "/companies", title: "Companies" },
        { trigger: "Ventures", route: "/ventures", title: "Ventures" },
        { trigger: "Tribes", route: "/tribes", title: "Tribes" },
    ].forEach((goal) => {
        it(`opens the ${goal.title} list from home`, () => {
            goToList(goal);
        });
    });

    it("opens the Syndication list from home", () => {
        cy.contains("button", "Manage endpoints").click();
        cy.location("pathname").should("eq", "/syndication");
        waitForPageShell(".LoadingSkeleton--collection");
        cy.contains("h1", "Syndication").should("be.visible");
    });
});

describe("details", () => {
    beforeEach(() => {
        mountHome();
    });

    [
        {
            selector: ".SplashEntityCard__itemLink",
            label: "Dockmaster",
            route: "/jobs/job-dockmaster",
            title: "Dockmaster",
        },
        {
            selector: ".SplashEntityCard__itemLink",
            label: "Solar Widget",
            route: "/products-services/product-solar-widget",
            title: "Solar Widget",
        },
        {
            selector: ".SplashEntityCard__itemLink",
            label: "Harbor Labs",
            route: "/companies/company-harbor-labs",
            title: "Harbor Labs",
        },
        {
            selector: ".SplashEntityCard__itemLink",
            label: "Sky Relay",
            route: "/ventures/startup-sky-relay",
            title: "Sky Relay",
        },
        {
            selector: ".SplashPage__identityHeadingLink",
            label: "Nova Rivers",
            route: "/tribes/identity-nova",
            title: "Nova Rivers",
        },
        {
            selector: ".SplashPage__syndicationCardTitleLink",
            label: "Main",
            route: `/syndication/${encodeURIComponent("http://127.0.0.1:3010")}`,
            title: "Main",
        },
    ].forEach((goal) => {
        it(`opens the ${goal.title} detail from home`, () => {
            openDetailFromHome(goal.selector, goal.label, goal.route, goal.title);
        });
    });

    [
        {
            scopeLabel: "Jobs",
            searchTitle: "Job search",
            term: "Dockmaster",
            resultLabel: "Dockmaster",
            route: "/jobs/job-dockmaster",
            title: "Dockmaster",
        },
        {
            scopeLabel: "Products / Services",
            searchTitle: "Product / Service search",
            term: "Solar Widget",
            resultLabel: "Solar Widget",
            route: "/products-services/product-solar-widget",
            title: "Solar Widget",
        },
        {
            scopeLabel: "Companies",
            searchTitle: "Company search",
            term: "Harbor Labs",
            resultLabel: "Harbor Labs",
            route: "/companies/company-harbor-labs",
            title: "Harbor Labs",
        },
        {
            scopeLabel: "Tribes",
            searchTitle: "Tribe search",
            term: "Nova Rivers",
            resultLabel: "Nova Rivers",
            route: "/tribes/identity-nova",
            title: "Nova Rivers",
        },
        {
            scopeLabel: "Ventures",
            searchTitle: "Startup search",
            term: "Sky Relay",
            resultLabel: "Sky Relay",
            route: "/ventures/startup-sky-relay",
            title: "Sky Relay",
        },
    ].forEach((goal) => {
        it(`opens the ${goal.title} detail through ${goal.scopeLabel} search`, () => {
            openDetailFromSearch(goal.scopeLabel, goal.searchTitle, goal.term, goal.resultLabel, goal.route, goal.title);
        });
    });
});
