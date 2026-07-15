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
import {
    MARKET_ACCORDION_POSTS_QUERY_LIMIT,
} from "../../../src/components/splash/constants";
import { NSFW_CONSENT_STORAGE_KEY } from "../../../src/components/endpoints/constants";
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

    cy.get(".EntityDetail")
        .should("be.visible")
        .scrollIntoView()
        .screenshot(nextName.length > 0 ? nextName : "after-test-step", {
            capture: "viewport",
        });
};

export const mountMainRoute = (route: string, beforeMount?: (win: Window) => void) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        beforeMount?.(win);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const getRouteEntityId = (pathname: string): string => {
    const segments = pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 2];

    if (id === undefined) {
        throw new Error(`Missing route entity id in pathname: ${pathname}`);
    }

    return id;
};

const buildAuthStorageKey = (serverUrl: string) =>
    `oidc.user:${serverUrl}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;

const seedAuthorizedProfile = (win: Window, serverUrl: string, emailVerified = true) => {
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
            email_verified: emailVerified,
            name: "Nova Rivers",
            picture: "https://example.test/nova.png",
        },
    });

    win.localStorage.setItem(buildAuthStorageKey(serverUrl), user.toStorageString());
};

export const mountProfileRoute = (
    serverUrls: string[] = [BACKEND_URL],
    emailVerified = true,
    beforeMount?: (win: Window) => void,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl, emailVerified));
        beforeMount?.(win);
        win.history.pushState({}, "", "/profile");
    });
    mount(<Main />);
};

export const mountAuthenticatedRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    emailVerified = true,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl, emailVerified));
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
};

export const mountAuthenticatedCartRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    cartSecrets?: Record<string, string>,
    emailVerified = true,
    setup?: (win: Window) => void,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl, emailVerified));
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (cartSecrets) {
            const entries = Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret }));
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(entries));
        }
        win.localStorage.removeItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY);
        setup?.(win);
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const mountAuthenticatedDetailRoute = (
    route: string,
    serverUrls: string[] = [BACKEND_URL],
    savedShippingAddress?: AddressWithEmail,
    emailVerified = true,
    setup?: (win: Window) => void,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl, emailVerified));
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (savedShippingAddress) {
            win.localStorage.setItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY, JSON.stringify(savedShippingAddress));
        } else {
            win.localStorage.removeItem(SAVED_SHIPPING_ADDRESS_STORAGE_KEY);
        }
        setup?.(win);
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const mountAuthenticatedMainRoute = (
    route: string,
    emailVerified = true,
    setup?: (win: Window) => void,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        seedAuthorizedProfile(win, BACKEND_URL, emailVerified);
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
        setup?.(win);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const mockOwnedCompaniesByCreatorQuery = (
    docs: Array<{
        id: string;
        name: string;
        isPrivate: boolean;
    }>,
) => {
    cy.intercept("POST", "**/api/graphql", (req) => {
        const body = req.body as { operationName?: string; query?: string };

        if (body.operationName === "ListCompaniesByCreator" || body.query?.includes("ListCompaniesByCreator")) {
            req.alias = "ownedCompanies";
            req.reply({
                data: {
                    __typename: "Query",
                    Companies: {
                        __typename: "Companies",
                        docs: docs.map((company) => ({
                            __typename: "Company",
                            id: company.id,
                            isSubscribed: false,
                            serverURL: MAIN_SERVER_URL,
                            name: company.name,
                            verification: "Trader",
                            isPrivate: company.isPrivate,
                            likeCount: 0,
                            cryptoAddresses: {
                                chain: "Ethereum",
                                address: "0xOwnedCompany",
                            },
                            image: null,
                            _status: "published",
                        })),
                        totalDocs: docs.length,
                        limit: 100,
                        totalPages: 1,
                        page: 1,
                        hasPrevPage: false,
                        hasNextPage: false,
                        prevPage: null,
                        nextPage: null,
                    },
                },
            });
        }
    });
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
    beforeMount?: (win: Window) => void,
) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        if (cartSecrets) {
            const entries = Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret }));
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(entries));
        }
        if (beforeMount) {
            beforeMount(win);
        }
        win.history.pushState({}, "", route);
    });
    mount(<Main />);
    cy.routerNavigate(route);
};

export const openPublishServerIfNeeded = () => {
    cy.get(".LoadingSkeleton--surface").should("not.exist");
    cy.get("body").should(($body) => {
        expect($body.find(".Publish__category, .Publish__postTitleField").length).to.be.greaterThan(0);
    });

    cy.get("body").then(($body) => {
        if ($body.find(".Publish__postTitleField").length > 0) {
            if ($body.find(".Publish__back").length > 0) {
                cy.contains(".Publish__back", "Back").click();
                cy.contains(".Publish__category", "Company").should("be.visible");
            }
            return;
        }
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
    const formSelectorByCategory: Record<string, string> = {
        Job: ".Publish__jobTitleField",
        Company: ".Publish__companyNameField",
        Product: ".Publish__productNameField",
        Post: ".Publish__postTitleField",
        Venture: ".Publish__startupTitleField",
    };
    const formSelector = formSelectorByCategory[categoryName];
    cy.get("body").then(($body) => {
        const visibleFormSelector = Object.values(formSelectorByCategory).find((selector) => $body.find(selector).length > 0);

        if (visibleFormSelector === formSelector) {
            return;
        }

        if (visibleFormSelector !== undefined && $body.find(".Publish__back").length > 0) {
            cy.contains(".Publish__back", "Back").click();
        }

        cy.contains(".Publish__categoryTitle", categoryTitle).should("be.visible").click();
        screenshotStep(`publish-category-${categoryName}`);
    });
};

const getFormItem = (label: string) => cy.contains(".ant-form-item", label);

export const fillFormField = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().clear({ force: true }).type(value, { force: true });
};

export const assertFormFieldValue = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().should("have.value", value);
};

export const selectFormOption = (label: string, optionLabel: string) => {
    getFormItem(label).find(".ant-select-selector").first().click({ force: true });
    cy.get(".ant-select-dropdown").should("be.visible");
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", optionLabel).click({
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
    cy.get(".AddToCartButton__quantity").should("be.visible");
};

export const dismissNsfwModal = (action: "continue" | "disable" = "continue") => {
    const buttonLabel = action === "disable" ? "Disable NSFW servers" : "Continue to site";

    cy.get("body").then(($body) => {
        const modal = $body
            .find(".SyndicationNsfwModal:visible, .ant-modal:visible")
            .filter((_, element) => Cypress.$(element).text().includes("18+ content"))
            .first();

        if (modal.length === 0) {
            return;
        }

        cy.wrap(modal)
            .contains("button", buttonLabel)
            .should("be.visible")
            .click({ force: true });
        cy.contains(".SyndicationNsfwModal, .ant-modal", "18+ content").should("not.be.visible");
    });
};

export const seedNsfwConsent = (win: Window) => {
    win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
};

export const clearServerCarts = (serverUrl: string) => {
    const listCartsQuery = `
        query ListCarts {
            Carts(draft: false, limit: 1000) {
                docs {
                    id
                }
            }
        }
    `;
    const deleteCartMutation = `
        mutation DeleteCart($id: String!, $trash: Boolean) {
            deleteCart(id: $id, trash: $trash) {
                id
            }
        }
    `;

    return cy
        .request({
            body: {
                query: listCartsQuery,
            },
            method: "POST",
            url: `${serverUrl}/api/graphql`,
        })
        .then((response: Cypress.Response<{ data?: { Carts?: { docs?: { id?: string }[] } } }>) => {
            const cartIds = (response.body.data?.Carts?.docs || []).flatMap((cart) => {
                return cart.id ? [cart.id] : [];
            });

            cartIds.forEach((cartId) => {
                cy.request({
                    body: {
                        query: deleteCartMutation,
                        variables: {
                            id: cartId,
                            trash: false,
                        },
                    },
                    method: "POST",
                    url: `${serverUrl}/api/graphql`,
                });
            });
        });
};

export const removeFromCart = () => {
    cy.get('button[aria-label="Remove"]').click();
};

export const setCartQuantity = (quantity: number) => {
    cy.get(".AddToCartButton__quantity").find("input").clear({ force: true }).type(String(quantity), { force: true });
};

export const mountMainHome = (beforeMount?: (win: Window) => void) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        beforeMount?.(win);
    });
    mount(<Main />);
    cy.routerNavigate("/");
    cy.get(".SplashPage").should("be.visible");
    cy.contains(".SplashPage__heroActions", "Explore market").should("be.visible");
    cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
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
    });
};

export const homepageQueries = () => {
    waitForCollectionQuery(MAIN_SERVER_URL, "ListProducts", { limit: 7, page: 1 }, "Products", "Solar Widget", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListJobs", { limit: 7, page: 1 }, "Jobs", "Dockmaster", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListCompanies", { limit: 7, page: 1 }, "Companies", "Harbor Labs", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListStartups", { limit: 7, page: 1 }, "Startups", "Sky Relay", 0);
    waitForCollectionQuery(MAIN_SERVER_URL, "ListIdentities", { limit: 7, page: 1 }, "Identities", "Nova Rivers", 0);
    waitForCollectionQuery(
        MAIN_SERVER_URL,
        "ListPosts",
        { limit: MARKET_ACCORDION_POSTS_QUERY_LIMIT, page: 1 },
        "Posts",
        "Harbor Operations Digest",
        0,
    );
    waitForCollectionQuery(MAIN_SERVER_URL, "ListPublishedSyndicationUrls", {}, "Syndications", "Main", 0);
    screenshotStep("homepage-queries-loaded");
};

export const homepageMobileQueries = () => {
    waitForCollectionQuery(
        MAIN_SERVER_URL,
        "ListPosts",
        { limit: MARKET_ACCORDION_POSTS_QUERY_LIMIT, page: 1 },
        "Posts",
        "Harbor Operations Digest",
        0,
    );
    screenshotStep("homepage-mobile-queries-loaded");
};

export const openDesktopMenu = () => {
    cy.get('button[aria-label="Open menu"]').click({ force: true });
};

export const openSearchScope = (scopeLabel: string) => {
    openDesktopMenu();
    cy.contains(".AppHeader__desktopDrawer button", "Search").click({ force: true });
    cy.get(".SearchButton__menuOverlay").should("be.visible").contains(scopeLabel).click({ force: true });
};

export const waitForPageShell = () => {
    cy.get(".LoadingSkeleton--surface").should("not.exist");
};

export const assertImageLoaded = (selector: string) => {
    cy.get(selector)
        .first()
        .scrollIntoView()
        .should("be.visible")
        .should(($img) => {
            const node = $img[0];
            const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
            expect((image as HTMLImageElement)?.complete).to.equal(true);
            expect((image as HTMLImageElement)?.naturalWidth).to.be.greaterThan(0);
        });
};

export const waitForRouteLoad = (pageSkeletonSelector: string) => {
    cy.get("body").then(($body) => {
        if ($body.find(".LoadingSkeleton--surface").length > 0) {
            cy.get(".LoadingSkeleton--surface").should("not.exist");
        }

        if ($body.find(pageSkeletonSelector).length > 0) {
            cy.get(pageSkeletonSelector).should("not.exist");
        }
    });
};

export const waitForCollectionQuery = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedTitle: string,
    minimumDocs = 1,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, expectedVariables))}`).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const collection = response?.data?.[responseKey] as GraphQLCollectionResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.at.least(minimumDocs);
        if (minimumDocs > 0) {
            const matchedDoc = collection?.docs?.find((doc) => {
                const value = doc.title ?? doc.name ?? doc.content;
                return value === expectedTitle;
            });
            expect(Boolean(matchedDoc)).to.eq(true);
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
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, expectedVariables))}`).then((interception) => {
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
    cy.wait(`@${gqlAlias(serverUrl, "MeUser", expectedVariables)}`).then((interception) => {
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
    const variables = {
        ...expectedVariables,
        url: expectedVariables.url ?? serverUrl,
    };

    cy.wait(`@${gqlAlias(serverUrl, operationName, variables)}`).then((interception) => {
        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        cy.contains("h1", expectedTitle).should("be.visible").scrollIntoView();
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
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, { searchTerm, page, limit: 5 }))}`).then(
        (interception) => {
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
    cy.wait(`@${gqlAlias(serverUrl, operationName, withDefaultSort(operationName, { searchTerm, page, limit: 5 }))}`).then(
        (interception) => {
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
    if (goal.trigger === "Market") {
        mountAnonymousRoute(goal.route, [MAIN_SERVER_URL, COOP_SERVER_URL], undefined, seedNsfwConsent);
        cy.location("pathname").should("eq", goal.route);
        cy.contains("h2", goal.title).should("be.visible");
        cy.get(".ProductList__actionsRow").first().should("be.visible");
        screenshotStep(`list-${goal.title}`);
        return;
    } else {
        mountAnonymousRoute(goal.route, [MAIN_SERVER_URL], undefined, seedNsfwConsent);
    }
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
    cy.contains("h2", goal.title).should("be.visible");
    cy.get("body").then(($body) => {
        if ($body.find(".LikeButton").length > 0) {
            cy.get(".LikeButton").should("exist");
        } else {
            cy.get(".LikeButton").should("not.exist");
        }
    });
    if (goal.trigger === "Posts") {
        cy.get("body").then(($body) => {
            const avatarImgs = $body.find(".AppList .PostList__companyAvatar img");
            if (avatarImgs.length > 0) {
                expect(avatarImgs[0].getAttribute("src") || "").to.contain("preview-image.png");
            }

            const coverImgs = $body.find(".AppList .PostList__coverImage img");
            if (coverImgs.length > 0) {
                expect(coverImgs[0].getAttribute("src") || "").to.contain("nswap-hero-bg.svg");
            }
        });
    }
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
    cy.contains(goal.detailTitleSelector, goal.title).should("be.visible");
    if (goal.route.startsWith("/posts/")) {
        cy.get(".PostDetail__companyAvatar").should("be.visible");
        cy.get(".PostDetail__heroSplash img").should(($img) => {
            expect($img[0].getAttribute("src") || "").to.contain("nswap-hero-bg.svg");
        });
    }
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
        cy.get(".SearchDrawer .PostList__companyAvatar").first().should("be.visible");
    }
    cy.get(`.SearchDrawer a[href="${goal.route}"]`).first().should("be.visible").click();
    cy.location("pathname").should("eq", goal.route);
    cy.get(".SearchDrawer").should("not.exist");
    waitForPageShell();
    cy.contains("h1", goal.title).should("be.visible");
    if (goal.scopeLabel === "Posts") {
        cy.get(".PostDetail__companyAvatar").should("be.visible");
        cy.get(".PostDetail__heroSplash img").should(($img) => {
            expect($img[0].getAttribute("src") || "").to.contain("nswap-hero-bg.svg");
        });
    }
};

export const goToSyndicationList = () => {
    cy.get(".SplashPage__syndicationManageBtn")
        .contains(SYNDICATION_LIST_GOAL.clickLabel)
        .click({ waitForAnimations: false });
    cy.location("pathname").should("eq", SYNDICATION_LIST_GOAL.route);
    waitForPageShell();
    screenshotStep("syndication-list");
};
