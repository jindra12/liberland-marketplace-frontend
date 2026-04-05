export const CT_TIMEOUT_MS = 5000;
export const CT_NAVIGATION_TIMEOUT_MS = 45000;
const CT_LOADER_TIMEOUT_MS = 5000;

export type MarketplaceEndpoint = {
    description?: string;
    enabled: boolean;
    name: string;
    value: string;
};

export const logTestStep = (message: string) => {
    console.log("[ct] " + message);
};

export const setInitialPath = (path: string) => {
    logTestStep("Set initial path " + path);
    cy.window().then((win) => {
        win.history.replaceState({}, "", path);
    });
    logTestStep("Finished setting initial path " + path);
};

export const setMarketplaceEndpoints = (endpoints: MarketplaceEndpoint[]) => {
    logTestStep("Set marketplace endpoints");
    cy.window().then((win) => {
        win.localStorage.clear();
        win.localStorage.setItem("endpoints.urls", JSON.stringify(endpoints));
    });
    logTestStep("Finished setting marketplace endpoints");
};

export const navigateToPath = (path: string) => {
    logTestStep("Navigate to " + path);
    cy.routerNavigate(path);
    logTestStep("Finished navigating to " + path);
};

export const resetMockScenario = (url: string, scenario = "default") => {
    logTestStep("Reset mock scenario " + scenario + " for " + url);
    cy.request({
        body: {
            scenario,
        },
        failOnStatusCode: true,
        method: "POST",
        url: url + "/__admin/reset",
    });
    logTestStep("Finished resetting mock scenario " + scenario + " for " + url);
};

export const goHome = () => {
    logTestStep("Go home");
    navigateToPath("/");
    logTestStep("Finished going home");
};

const waitForLoaderTransition = (selector: string) => {
    cy.get("body").then(($body) => {
        if ($body.find(selector).length === 0) {
            return;
        }

        cy.get(selector, { timeout: CT_LOADER_TIMEOUT_MS }).should("be.visible");
        cy.get(selector, { timeout: CT_TIMEOUT_MS }).should("not.exist");
    });
};

export const waitForSplashContent = () => {
    logTestStep("Wait for splash content");
    waitForLoaderTransition(".LoadingSkeleton--splashSections");
    cy.get(".SplashPage__hero", { timeout: CT_TIMEOUT_MS }).should("be.visible");
    logTestStep("Finished waiting for splash content");
};

export const waitForCollectionContent = () => {
    logTestStep("Wait for collection content");
    waitForLoaderTransition(".LoadingSkeleton--collection");
    cy.get(".AppList__title", { timeout: CT_TIMEOUT_MS }).should("be.visible");
    logTestStep("Finished waiting for collection content");
};

export const waitForDetailContent = () => {
    logTestStep("Wait for detail content");
    waitForLoaderTransition(".LoadingSkeleton--detail");
    cy.get(".EntityDetail__title, .JobDetail__title, .StartupDetail__title", { timeout: CT_TIMEOUT_MS })
        .first()
        .should(($title) => {
            expect($title.text()).to.match(/.+/);
        });
    logTestStep("Finished waiting for detail content");
};

export const openAppMenu = () => {
    logTestStep("Open app menu");
    cy.get("body").then(($body) => {
        const openMenuButton = $body.find('button[aria-label="Open menu"]');
        if (openMenuButton.length > 0) {
            cy.wrap(openMenuButton.first()).click();
            cy.get(".AppHeader__desktopDrawerNav", { timeout: CT_TIMEOUT_MS }).should("be.visible");
            logTestStep("Finished opening app menu");
            return;
        }

        const openNavigationButton = $body.find('button[aria-label="Open navigation"]');
        if (openNavigationButton.length > 0) {
            cy.wrap(openNavigationButton.first()).click();
            cy.get(".AppHeader__drawerBody", { timeout: CT_TIMEOUT_MS }).should("be.visible");
        }

        logTestStep("Finished opening app menu");
    });
};

export const clickHeaderLink = (label: string) => {
    logTestStep("Click header link " + label);
    cy.get("body").then(($body) => {
        const headerLink = $body
            .find(".AppHeader__menuLink")
            .filter((_, element) => Cypress.$(element).text().includes(label));

        if (headerLink.length > 0) {
            cy.wrap(headerLink.first()).click();
            logTestStep("Finished clicking header link " + label);
            return;
        }

        openAppMenu();
        cy.get(".AppHeader__drawerMenuLink", { timeout: CT_TIMEOUT_MS })
            .filter((_, element) => Cypress.$(element).text().includes(label))
            .first()
            .click();
        logTestStep("Finished clicking header link " + label);
    });
};

export const clickVisibleLink = (label: string) => {
    logTestStep("Click visible link " + label);
    cy.contains("a", label, { timeout: CT_TIMEOUT_MS }).click({ force: true });
    logTestStep("Finished clicking visible link " + label);
};

export const clickSplashSectionLink = (label: string) => {
    logTestStep("Click splash section link " + label);
    cy.contains(".SplashEntityCard__titleLink", label, { timeout: CT_TIMEOUT_MS })
        .should("be.visible")
        .click();
    logTestStep("Finished clicking splash section link " + label);
};

export const scrollToBottom = () => {
    logTestStep("Scroll to bottom");
    cy.get("body").click(10, 10);
    cy.get("body").type("{end}");
    cy.window().then((win) => {
        const scrollTarget = win.document.querySelector(".InfinityScroll") as HTMLElement | null;
        const infiniteScrollComponent = win.document.querySelector(".infinite-scroll-component") as HTMLElement | null;
        const root = win.document.scrollingElement || win.document.documentElement;
        const bottom = Math.max(0, root.scrollHeight - win.innerHeight);

        if (scrollTarget) {
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
            scrollTarget.dispatchEvent(new Event("scroll", { bubbles: true }));
        }

        if (infiniteScrollComponent) {
            infiniteScrollComponent.scrollTop = infiniteScrollComponent.scrollHeight;
            infiniteScrollComponent.dispatchEvent(new Event("scroll", { bubbles: true }));
        }

        root.scrollTop = bottom;
        win.scrollTo(0, bottom);
        root.dispatchEvent(new Event("scroll"));
        win.document.dispatchEvent(new Event("scroll"));
        win.dispatchEvent(new Event("scroll"));
    });
    cy.wait(500);
    logTestStep("Finished scrolling to bottom");
};

export const openSyndicationPage = () => {
    logTestStep("Open syndication page");
    openAppMenu();
    cy.get("body").then(($body) => {
        const drawerNavLink = $body
            .find(".AppHeader__drawerNav, .AppHeader__desktopDrawerNav")
            .find("a")
            .filter((_, element) => Cypress.$(element).text().includes("Syndication"));

        if (drawerNavLink.length > 0) {
            cy.wrap(drawerNavLink.first()).click();
            logTestStep("Finished opening syndication page");
            return;
        }

        cy.get(".SplashPage__syndicationManageBtn", { timeout: CT_TIMEOUT_MS }).click();
        logTestStep("Finished opening syndication page");
    });
};
