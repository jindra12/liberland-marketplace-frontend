import { UserManager } from "oidc-client-ts";

import { COOP_SERVER_URL, GUEST_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    mountAuthenticatedDetailRoute,
    mountAuthenticatedMainRoute,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
} from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

type SigninRequestClient = {
    createSigninRequest: (args: { request_type: "si:r" }) => Promise<{ url: string }>;
};

type SigninRedirectUserManager = UserManager & {
    _client: SigninRequestClient;
};
type SigninRedirectArgs = Parameters<SigninRedirectUserManager["signinRedirect"]>[0];

const buildListCompaniesByCreatorResponse = (docs: Array<{ id: string; name: string; isPrivate: boolean }>) => ({
    data: {
        Companies: {
            docs: docs.map((company) => ({
                id: company.id,
                isSubscribed: false,
                serverURL: MAIN_SERVER_URL,
                name: company.name,
                verification: "Trader",
                isPrivate: company.isPrivate,
                likeCount: 0,
                cryptoAddresses: {
                    chain: "Ethereum",
                    address: "0xPublishCompany",
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

describe("publish", () => {
    it("opens the publish form directly from the create button when multiple endpoints are configured", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedDetailRoute("/jobs", [MAIN_SERVER_URL, GUEST_SERVER_URL], undefined, true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });

        cy.contains(".AppHeader__publishBtn", "Create", { timeout: 20000 }).should("be.visible").click();
        cy.get(".ant-dropdown:visible .ant-dropdown-menu-item", { timeout: 20000 }).first().click({ force: true });

        cy.location("pathname").should("eq", "/publish");
        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
        screenshotStep("publish-flow-visible");
    });

    it("opens the publish forms directly when only one endpoint is configured", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedMainRoute("/publish", true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });

        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".AppHeader__publishBtn", "Create").should("be.visible").within(() => {
            cy.get(".anticon-plus").should("be.visible");
        });
        screenshotStep("publish-chooser-visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
    });

    it("uses the selected non-main endpoint before redirecting anonymous users to login", () => {
        cy.viewport(1440, 1200);

        mountAnonymousRoute("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL]);

        let redirectUrl = "";
        let signinRedirectArgs: SigninRedirectArgs | undefined;
        cy.stub(UserManager.prototype, "signinRedirect").callsFake(async function (
            this: SigninRedirectUserManager,
            args?: SigninRedirectArgs,
        ) {
            signinRedirectArgs = args;
            const signinRequest = await this._client.createSigninRequest({
                request_type: "si:r",
            });

            redirectUrl = signinRequest.url;
        });

        cy.get(".SyndicationNsfwModal", { timeout: 20000 }).should("be.visible");
        cy.contains(".SyndicationNsfwModal button", "Continue to site", { timeout: 20000 }).click();
        cy.get(".SyndicationNsfwModal", { timeout: 20000 }).should("not.be.visible");
        cy.get(".AppHeader__authBtn", { timeout: 20000 }).should("contain.text", "Log in").click();
        cy.get(".LoginButton__menu", { timeout: 20000 }).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op", { timeout: 20000 })
            .should("be.visible")
            .click();

        cy.wrap(null, { timeout: 20000 }).should(() => {
            expect(redirectUrl).to.not.equal("");
            expect(signinRedirectArgs?.state).to.equal("/jobs");
            const parsedUrl = new URL(redirectUrl);

            expect(parsedUrl.origin).to.equal(COOP_SERVER_URL);
            expect(parsedUrl.pathname).to.equal("/api/auth/oauth2/authorize");
            expect(parsedUrl.searchParams.get("client_id")).to.be.a("string");
            expect(parsedUrl.searchParams.get("scope")).to.equal("openid profile email");
            expect(parsedUrl.searchParams.get("redirect_uri")).to.be.a("string");
        });
    });

    it("keeps the publish flow after selecting a server from the create dropdown", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedDetailRoute("/jobs", ["http://127.0.0.1:3013", MAIN_SERVER_URL, GUEST_SERVER_URL], undefined, true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });

        cy.contains(".AppHeader__publishBtn", "Create", { timeout: 20000 }).should("be.visible").click();
        cy.get(".ant-dropdown:visible .ant-dropdown-menu-item", { timeout: 20000 }).first().click({ force: true });

        cy.location("pathname").should("eq", "/publish");
        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Post").should("be.visible");
        cy.contains(".Publish__category", "Job").should("be.visible");
        cy.contains(".Publish__category", "Product").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
    });

    it("shows the email verification warning for unverified users", () => {
        mountAuthenticatedMainRoute("/publish", false);

        cy.contains(".Publish", "Email not verified", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish", "You need to verify your email address before you can publish listings.").should(
            "be.visible",
        );
    });

    it("shows the publish chooser when the owned companies are public", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "ListCompaniesByCreator" || body.query?.includes("ListCompaniesByCreator")) {
                req.alias = "ownedCompanies";
                req.reply(buildListCompaniesByCreatorResponse([{ id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false }]));
            }
        });

        mountAuthenticatedMainRoute("/publish");

        cy.wait("@ownedCompanies", { timeout: 20000 });
        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish__categories", "Company").should("be.visible");
        cy.contains(".Publish__categories", "Post").should("be.visible");
        cy.contains(".Publish__categories", "Job").should("be.visible");
        cy.contains(".Publish__categories", "Product").should("be.visible");
        cy.contains(".Publish__categories", "Venture").should("be.visible");
    });

    it("returns home from the post-only publish flow when all owned companies are private", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: true },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedMainRoute("/", true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });

        cy.contains(".AppHeader__publishBtn", "Create", { timeout: 20000 }).should("be.visible").click();
        cy.contains(".Publish__postTitleField", "Title", { timeout: 20000 }).should("be.visible");

        cy.contains(".Publish__back", "Back").click();

        cy.location("pathname").should("eq", "/");
    });
});
