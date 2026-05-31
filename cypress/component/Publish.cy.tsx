import { COOP_SERVER_URL, GUEST_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAuthenticatedDetailRoute,
    mountAuthenticatedMainRoute,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
} from "../support/component-tests/utils";

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
    it("shows the server selector when multiple endpoints are configured", () => {
        mountAuthenticatedDetailRoute("/publish", [MAIN_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".PublishServer", "Choose where to publish", { timeout: 20000 }).should("be.visible");
        cy.contains(".PublishServer__card", MAIN_SERVER_URL).should("be.visible");
        cy.contains(".PublishServer__card", COOP_SERVER_URL).should("be.visible");
        screenshotStep("publish-server-selector-visible");
    });

    it("opens the publish form chooser directly when only one endpoint is configured", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedMainRoute("/publish");

        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".AppHeader__publishBtn", "Create").should("be.visible").within(() => {
            cy.get(".anticon-plus").should("be.visible");
        });
        screenshotStep("publish-chooser-visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
    });

    it("keeps the publish chooser after selecting a server", () => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedDetailRoute("/publish", ["http://127.0.0.1:3013", MAIN_SERVER_URL, GUEST_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".PublishServer", "Choose where to publish", { timeout: 20000 }).should("be.visible");
        cy.contains(".PublishServer__card", COOP_SERVER_URL).click();
        cy.contains(".PublishServer__summary button", "Continue to publish").click();
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

    it("opens the post form directly when the owned companies are public", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "ListCompaniesByCreator" || body.query?.includes("ListCompaniesByCreator")) {
                req.alias = "ownedCompanies";
                req.reply(buildListCompaniesByCreatorResponse([{ id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false }]));
            }
        });

        mountAuthenticatedMainRoute("/publish");

        cy.wait("@ownedCompanies", { timeout: 20000 });
        cy.contains(".Publish", "Write a Post", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish__categories", "Company").should("not.exist");
        cy.contains(".Publish__postTitleField", "Title").should("be.visible");
    });
});
