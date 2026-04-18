import { mount } from "cypress/react";
import { User } from "oidc-client-ts";

import Main from "../../../src/Main";
import { CART_SECRETS_INDEX_KEY } from "../../../src/components/cart/cartSecrets";
import { BACKEND_URL } from "../../../src/gqlFetcher";
import type { URL as EndpointURL } from "../../../src/types";
import type { CartSecretEntry } from "../../../src/components/cart/cartSecrets";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../../../src/components/order/constants";
import type { AddressWithEmail } from "../../../src/components/order/types";

import { COOP_SERVER_URL, MAIN_SERVER_URL, SYNDICATION_LIST_GOAL } from "./constants";
import { buildGraphQLAlias } from "../graphqlMock";
import type {
    DetailGoal,
    GraphQLCollectionResponse,
    GraphQLResponseBody,
    GraphQLVariables,
    ListGoal,
    SearchGoal,
} from "./types";

export const gqlAlias = (serverUrl: string, operationName: string, variables: GraphQLVariables): string =>
    buildGraphQLAlias(serverUrl, operationName, variables);

export const screenshotStep = (step: string, capture: "fullPage" | "viewport" | "runner" = "fullPage") => {
    const nextName = `${Cypress.spec.name} ${step}`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    cy.screenshot(nextName.length > 0 ? nextName : "after-test-step", {
        capture,
    });
};

const withDefaultSort = (operationName: string, variables: GraphQLVariables): GraphQLVariables => {
    if (operationName === "ListPublishedSyndicationUrls" || operationName.includes("Comment")) {
        return variables;
    }

    return {
        ...variables,
        sort: "-contentRankScore",
    };
};

export const screenshotDetailStep = (step: string) => {
    const nextName = `${Cypress.spec.name} ${step}`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    cy.wait(1000);
    cy.get(".EntityDetail", { timeout: 20000 })
        .should("be.visible")
        .scrollIntoView()
        .screenshot(nextName.length > 0 ? nextName : "after-test-step", {
            capture: "viewport",
        });
};

export const mountMainRoute = (route: string) => {
    mount(<Main />);
    cy.routerNavigate(route);
};

const buildAuthStorageKey = (serverUrl: string) =>
    `oidc.user:${serverUrl}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;

const seedAuthorizedProfile = (win: Window, serverUrl: string) => {
    const now = Math.floor(Date.now() / 1000);
    const user = new User({
        access_token: "mock-profile-access-token",
        token_type: "Bearer",
        scope: "openid profile email",
        expires_at: now + 3600,
        profile: {
            iss: `${BACKEND_URL}/api/auth`,
            aud: "frontend-app",
            exp: now + 3600,
            iat: now,
            sub: "user-nova",
            email: "nova@example.test",
            email_verified: true,
            name: "Nova Rivers",
            picture: "https://example.test/nova.png",
        },
    });

    win.localStorage.setItem(buildAuthStorageKey(serverUrl), user.toStorageString());
};

export const mountProfileRoute = (serverUrls: string[] = [BACKEND_URL]) => {
    cy.window().then((win) => {
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl));
        win.history.pushState({}, "", "/profile");
    });
    mount(<Main />);
};

export const mountAuthenticatedRoute = (route: string, serverUrls: string[] = [BACKEND_URL]) => {
    cy.window().then((win) => {
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl));
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
};

export const mountAuthenticatedCartRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    cartSecrets?: Record<string, string>,
) => {
    cy.window().then((win) => {
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl));
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (cartSecrets) {
            const entries = Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret }));
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(entries));
        }
        win.localStorage.removeItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY);
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const mountAuthenticatedDetailRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    savedShippingAddress?: AddressWithEmail,
) => {
    cy.window().then((win) => {
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl));
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (savedShippingAddress) {
            win.localStorage.setItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY, JSON.stringify(savedShippingAddress));
        } else {
            win.localStorage.removeItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY);
        }
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const mountAuthenticatedMainRoute = (route: string) => {
    cy.window().then((win) => {
        seedAuthorizedProfile(win, BACKEND_URL);
        win.localStorage.setItem(
            "endpoints.urls",
            JSON.stringify([
                {
                    enabled: true,
                    value: BACKEND_URL,
                    name: "Main",
                },
            ]),
        );
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

const buildEndpointUrls = (serverUrls: string[]): EndpointURL[] => {
    return serverUrls.map((serverUrl, index) => ({
        enabled: true,
        value: serverUrl,
        name: index === 0 ? "Main" : index === 1 ? "Co-op" : `Server ${index + 1}`,
    }));
};

export const mountAnonymousRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    cartSecrets?: Record<string, string>,
) => {
    cy.window().then((win) => {
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (cartSecrets) {
            const entries = Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret }));
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(entries));
        }
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    if (cartSecrets) {
        cy.window().then((win) => {
            const entries = Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret }));
            const serialized = JSON.stringify(entries);
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, serialized);
            win.dispatchEvent(new win.StorageEvent("storage", { key: CART_SECRETS_INDEX_KEY, newValue: serialized }));
        });
    }
    cy.routerNavigate(route);
};

export const openPublishServerIfNeeded = (serverName = "Main") => {
    cy.get("body", { timeout: 20000 }).should(($body) => {
        expect($body.find(".PublishServer, .Publish__category").length).to.be.greaterThan(0);
    });

    cy.get("body").then(($body) => {
        if ($body.find(".PublishServer").length === 0) {
            return;
        }

        cy.contains(".PublishServer__card", serverName).should("be.visible").click();
        screenshotStep(`publish-server-selected-${serverName}`);
        cy.contains(".PublishServer__summary button", "Continue to publish").click();
        cy.get(".PublishServer").should("not.exist");
    });
};

export const openPublishCategory = (categoryName: string) => {
    const categoryTitleByName: Record<string, string> = {
        Job: "Job",
        Company: "Company",
        Product: "Product",
        Post: "Post",
        Venture: "Venture",
    };
    const categoryTitle = categoryTitleByName[categoryName];
    if (categoryTitle === undefined) {
        throw new Error(`Unknown publish category: ${categoryName}`);
    }

    openPublishServerIfNeeded();
    cy.contains(".Publish__categoryTitle", categoryTitle, { timeout: 20000 }).should("be.visible").click();
    screenshotStep(`publish-category-${categoryName}`);
};

const getFormItem = (label: string) => cy.contains(".ant-form-item", label);

export const fillFormField = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().clear({ force: true }).type(value, { force: true });
};

export const assertFormFieldValue = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().should("have.value", value);
};

export const selectFormOption = (label: string, optionLabel: string) => {
    getFormItem(label).find(".ant-select").first().click();
    cy.get(".ant-select-dropdown", { timeout: 20000 }).should("be.visible");
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", optionLabel, { timeout: 20000 }).click({
        force: true,
    });
};

export const assertSelectValue = (label: string, value: string) => {
    getFormItem(label).should("contain.text", value);
};

const uploadImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6cAAAAASUVORK5CYII=";
export const uploadTestImage = () => {
    cy.get('input[type="file"]').selectFile(
        {
            contents: Cypress.Buffer.from(uploadImageBase64, "base64"),
            fileName: "publish-image.png",
            mimeType: "image/png",
            lastModified: Date.now(),
        },
        { force: true },
    );
};

export const addToCart = () => {
    cy.get('button[aria-label="Add to cart"]').click();
};

export const removeFromCart = () => {
    cy.get('button[aria-label="Remove"]').click();
};

export const setCartQuantity = (quantity: number) => {
    cy.get(".AddToCartButton__quantity").find("input").clear({ force: true }).type(String(quantity), { force: true });
};

export const mountMainHome = () => {
    mountMainRoute("/");
    cy.get(".LoadingSkeleton--boot").should("not.exist");
    cy.get(".SplashPage").should("be.visible");
};

export const seedCartSecret = (serverUrl: string, secret: string) => {
    const entries: CartSecretEntry[] = [
        {
            url: serverUrl,
            secret,
        },
    ];

    cy.window().then((win) => {
        const serialized = JSON.stringify(entries);
        win.localStorage.setItem(CART_SECRETS_INDEX_KEY, serialized);
        win.dispatchEvent(new win.StorageEvent("storage", { key: CART_SECRETS_INDEX_KEY, newValue: serialized }));
    });
};

export const homepageQueries = () => {
    waitForCollectionQuery(MAIN_SERVER_URL, "ListProducts", { limit: 7, page: 1 }, "Products", "Solar Widget", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListJobs", { limit: 7, page: 1 }, "Jobs", "Dockmaster", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListCompanies", { limit: 7, page: 1 }, "Companies", "Harbor Labs", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListStartups", { limit: 7, page: 1 }, "Startups", "Sky Relay", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListIdentities", { limit: 7, page: 1 }, "Identities", "Nova Rivers", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListPublishedSyndicationUrls", {}, "Syndications", "Main", 0);
    screenshotStep("homepage-queries-loaded");
};

export const homepageMobileQueries = () => {
    waitForCollectionQuery(MAIN_SERVER_URL, "ListProducts", { limit: 3, page: 1 }, "Products", "Solar Widget", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListJobs", { limit: 3, page: 1 }, "Jobs", "Dockmaster", 0);
    screenshotStep("homepage-mobile-queries-loaded");
};

export const openDesktopMenu = () => {
    cy.get('button[aria-label="Open menu"]').click();
};

export const openSearchScope = (scopeLabel: string) => {
    openDesktopMenu();
    cy.contains(".AppHeader__desktopDrawer button", "Search").click();
    cy.get(".SearchButton__menuOverlay").should("be.visible").contains(scopeLabel).click();
};

export const waitForPageShell = () => {
    cy.get(".LoadingSkeleton--surface").should("not.exist");
};

export const waitForRouteLoad = (pageSkeletonSelector: string) => {
    cy.get(".LoadingSkeleton--surface").should("exist");
    cy.get(".LoadingSkeleton--surface").should("not.exist");
    cy.get(pageSkeletonSelector).should("exist");
    cy.get(pageSkeletonSelector).should("not.exist");
};

export const waitForCollectionQuery = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedTitle: string,
    minimumDocs = 1,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, expectedVariables))}`, {
        timeout: 20000,
    }).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const collection = response?.data?.[responseKey] as GraphQLCollectionResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.at.least(minimumDocs);
        if (minimumDocs > 0) {
            expect(
                collection?.docs?.[0]?.title ?? collection?.docs?.[0]?.name ?? collection?.docs?.[0]?.content,
            ).to.equal(expectedTitle);
        }
        screenshotStep(`${operationName}-${expectedTitle}`, "viewport");
    });
};

export const waitForCollectionResults = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, expectedVariables))}`, {
        timeout: 20000,
    }).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const collection = response?.data?.[responseKey] as GraphQLCollectionResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.greaterThan(0);
        screenshotStep(`${operationName}-results`);
    });
};

type MeUserQueryResponse = {
    data?: {
        meUser?: {
            user?: {
                email?: string | null;
                name?: string | null;
                phone?: string | null;
                shippingAddress?: {
                    addressLine1?: string | null;
                    addressLine2?: string | null;
                    city?: string | null;
                    country?: string | null;
                    postalCode?: string | null;
                    state?: string | null;
                } | null;
                wallets?: Array<{
                    address?: string | null;
                    chain?: string | null;
                    provider?: string | null;
                } | null> | null;
            } | null;
        } | null;
    };
};

export const waitForMeUserQuery = (
    serverUrl: string,
    expectedName: string,
    expectedVariables: GraphQLVariables = { url: serverUrl },
) => {
    cy.wait(`@${gqlAlias(serverUrl, "MeUser", expectedVariables)}`, { timeout: 20000 }).then((interception) => {
        const response = interception.response?.body as MeUserQueryResponse | undefined;
        const user = response?.data?.meUser?.user;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(user?.name).to.equal(expectedName);
        screenshotStep(`me-${expectedName}`);
    });
};

export const waitForDetailQuery = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedId: string,
    expectedTitle: string,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, expectedVariables)}`, { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        cy.contains("h1", expectedTitle, { timeout: 20000 }).should("be.visible").scrollIntoView();
        screenshotDetailStep(`${operationName}-${expectedTitle}`);
    });
};

export const waitForSearchQuery = (
    serverUrl: string,
    operationName: string,
    searchTerm: string,
    expectedTitle: string,
    page = 1,
) => {
    cy.wait(
        `@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, { searchTerm, page, limit: 5 }))}`,
        { timeout: 20000 },
    ).then((interception) => {
            const response = interception.response?.body as GraphQLResponseBody | undefined;
            const collection = response?.data?.Searches as GraphQLCollectionResponse | undefined;

            expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(collection?.docs?.length ?? 0).to.be.greaterThan(0);
            expect(
                collection?.docs?.[0]?.title ?? collection?.docs?.[0]?.name ?? collection?.docs?.[0]?.content,
            ).to.equal(expectedTitle);
            screenshotStep(`${operationName}-${expectedTitle}`);
        },
    );
};

export const waitForSearchResultsPage = (
    serverUrl: string,
    operationName: string,
    searchTerm: string,
    page: number,
) => {
    cy.wait(
        `@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, { searchTerm, page, limit: 5 }))}`,
        { timeout: 20000 },
    ).then((interception) => {
            const response = interception.response?.body as GraphQLResponseBody | undefined;
            const collection = response?.data?.Searches as GraphQLCollectionResponse | undefined;

            expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(collection?.docs?.length ?? 0).to.be.greaterThan(0);
            screenshotStep(`${operationName}-page-${page}`);
        },
    );
};

export const goToList = (goal: ListGoal) => {
    cy.get("body").then(($body) => {
        const trigger = $body.find(".AppHeader__menuLink").filter((_, element) => element.textContent === goal.trigger);
        if (trigger.length > 0) {
            cy.contains(".AppHeader__menuLink", goal.trigger).click();
            return;
        }

        mountMainRoute(goal.route);
    });
    cy.location("pathname").should("eq", goal.route);
    waitForPageShell();
    waitForCollectionQuery(
        MAIN_SERVER_URL,
        goal.operationName,
        goal.expectedVariables,
        goal.responseKey,
        goal.expectedResultTitle,
        goal.minimumDocs ?? 1,
    );
    cy.get(".LoadingSkeleton--surface").should("not.exist");
    cy.contains("h2", goal.title, { timeout: 20000 }).should("be.visible");
    cy.get("body").then(($body) => {
        if ($body.find(".LikeButton").length > 0) {
            cy.get(".LikeButton").should("exist");
            return;
        }

        cy.get(".LikeButton").should("not.exist");
    });
    screenshotStep(`list-${goal.title}`);
};

export const goToDetailFromHome = (goal: DetailGoal) => {
    if (goal.mountMode === "anonymous") {
        mountAnonymousRoute(goal.route, [MAIN_SERVER_URL, COOP_SERVER_URL]);
    } else {
        mountMainRoute(goal.route);
    }
    if (goal.query) {
        waitForDetailQuery(
            MAIN_SERVER_URL,
            goal.query.operationName,
            goal.query.expectedVariables,
            goal.query.responseKey,
            goal.query.expectedId,
            goal.title,
        );
    }
    cy.contains(goal.detailTitleSelector, goal.title, { timeout: 20000 }).should("be.visible");
    screenshotDetailStep(`detail-${goal.title}`);
};

export const goToDetailFromSearch = (goal: SearchGoal) => {
    openSearchScope(goal.scopeLabel);
    cy.get(".SearchDrawer")
        .filter(":visible")
        .last()
        .should("be.visible")
        .within(() => {
            cy.get(".SearchDrawer__footerForm input").first().should("be.visible").click({ force: true });
            cy.get(".SearchDrawer__footerForm input").first().clear({ force: true }).type(goal.term, { force: true });
            cy.get(".SearchDrawer__footerForm input").first().should("have.value", goal.term);
            cy.get(".SearchDrawer__footerForm").submit();
        });
    waitForSearchQuery(MAIN_SERVER_URL, goal.searchOperationName, goal.term, goal.searchExpectedTitle);
    if (goal.scopeLabel === "Posts") {
        cy.get(".SearchDrawer .PostList__companyTag").first().should(($tag) => {
            expect($tag[0].getBoundingClientRect().width).to.be.lessThan(250);
        });
    }
    cy.get(`.SearchDrawer a[href="${goal.route}"]`, { timeout: 20000 }).first().should("be.visible").click();
    cy.location("pathname").should("eq", goal.route);
    cy.get(".SearchDrawer").should("not.exist");
    waitForPageShell();
    cy.contains("h1", goal.title).should("be.visible");
};

export const goToSyndicationList = () => {
    cy.get(".SplashPage__syndicationManageBtn").contains(SYNDICATION_LIST_GOAL.clickLabel).click();
    cy.location("pathname").should("eq", SYNDICATION_LIST_GOAL.route);
    waitForPageShell();
    cy.contains("h2", SYNDICATION_LIST_GOAL.title).should("be.visible");
    screenshotStep("syndication-list");
};
