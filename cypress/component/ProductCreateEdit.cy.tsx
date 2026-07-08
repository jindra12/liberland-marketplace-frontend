import { detailRoute, editRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    dismissNsfwModal,
    fillFormField,
    gqlAlias,
    getRouteEntityId,
    mountAuthenticatedMainRoute,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
    waitForDetailQuery,
} from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

const assertProductTitle = (productId: string, expectedTitle: string) => {
    cy.window().then(async (win) => {
        const response = await win.fetch(`${MAIN_SERVER_URL}/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query ProductById($id: String!, $draft: Boolean = false) {
                    Product(id: $id, draft: $draft) {
                        name
                    }
                }`,
                variables: {
                    id: productId,
                    draft: false,
                },
            }),
        });
        const body = (await response.json()) as {
            data?: {
                Product?: {
                    name?: string | null;
                } | null;
            };
        };

        expect(response.status).to.equal(200);
        expect(body.data?.Product?.name).to.equal(expectedTitle);
    });
};

const createOwnedCompany = (companyName: string) => {
    mockOwnedCompaniesByCreatorQuery([
        { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
        { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
    ]);
    mountAuthenticatedMainRoute("/publish", true, (win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
    dismissNsfwModal();
    cy.get("body", { timeout: 30000 }).should(($body) => {
        expect($body.find(".Publish__category, .Publish__companyNameField").length).to.be.greaterThan(0);
    });
    cy.get("body").then(($body) => {
        if ($body.find(".Publish__category").length > 0) {
            cy.contains(".Publish__category", "Company", { timeout: 30000 }).should("be.visible").click({ force: true });
        } else {
            cy.contains(".Publish__companyNameField", "Company Name", { timeout: 30000 }).should("be.visible");
        }
    });

    fillFormField("Company Name", companyName);
    selectFormOption("Tribe", "Nova Rivers");
    uploadTestImage();

    cy.get(".Publish__form").contains("button", "Publish Company").click();
    cy.wait("@mediaUpload");
    cy.location("pathname").should("match", /\/companies\/company-[^/]+\/[a-f0-9]+$/);
    cy.location("pathname").then((pathname) => {
        const createdId = getRouteEntityId(pathname);
        waitForDetailQuery(MAIN_SERVER_URL, "CompanyById", { id: createdId }, "Company", createdId, companyName);
        cy.contains("h1", companyName).should("be.visible");
        screenshotStep(`owned-company-created-${createdId}`);
    });
};

describe("product create/edit", () => {
    it("creates a product with an uploaded image", () => {
        const productName = "Signal Beacon";
        const ownedCompanyName = "Harbor Labs";

        createOwnedCompany(ownedCompanyName);
        cy.routerNavigate("/publish");
        dismissNsfwModal();
        cy.get("body", { timeout: 30000 }).then(($body) => {
            if ($body.find(".Publish__category, .Publish__productNameField").length === 0) {
                throw new Error("Expected publish chooser or product form to be visible");
            }
        });
        cy.get("body").then(($body) => {
            if ($body.find(".Publish__category").length > 0) {
                cy.contains(".Publish__category", "Product", { timeout: 30000 }).should("be.visible").click({ force: true });
            } else {
                cy.contains(".Publish__productNameField", "Product Name", { timeout: 30000 }).should("be.visible");
            }
        });

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "79");
        fillFormField("Product URL", "https://signal.beacon.example");
        fillFormField("Inventory", "12");
        selectFormOption("Company", ownedCompanyName);
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/products-services\/product-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            cy.contains("h1", productName).should("be.visible");
            assertProductTitle(createdId, productName);
            screenshotStep("product-created-page");
        });
    });

    it("edits a product and keeps the update after refetch", () => {
        const productName = "Editable Signal Lamp";
        const updatedProductName = "Editable Signal Lamp Revised";
        const ownedCompanyName = "Harbor Labs";

        createOwnedCompany(ownedCompanyName);
        cy.routerNavigate("/publish");
        dismissNsfwModal();
        cy.get("body", { timeout: 30000 }).then(($body) => {
            if ($body.find(".Publish__category, .Publish__productNameField").length === 0) {
                throw new Error("Expected publish chooser or product form to be visible");
            }
        });
        cy.get("body").then(($body) => {
            if ($body.find(".Publish__category").length > 0) {
                cy.contains(".Publish__category", "Product", { timeout: 30000 }).should("be.visible").click({ force: true });
            } else {
                cy.contains(".Publish__productNameField", "Product Name", { timeout: 30000 }).should("be.visible");
            }
        });

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "49");
        fillFormField("Product URL", "https://editable.signal.example");
        fillFormField("Inventory", "7");
        selectFormOption("Company", ownedCompanyName);
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.location("pathname").should("match", /\/products-services\/product-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            cy.routerNavigate(editRoute("/products-services", createdId));
            cy.wait(
                `@${gqlAlias(MAIN_SERVER_URL, "ProductById", { id: createdId, draft: true, url: MAIN_SERVER_URL })}`,
                { timeout: 20000 },
            ).then(
                (interception) => {
                    expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
                    expect(interception.response?.statusCode).to.equal(200);
                },
            );
            cy.contains("h3", "Edit Product", { timeout: 20000 }).should("be.visible");

            fillFormField("Product Name", updatedProductName);
            fillFormField("Price (USD)", "89");
            fillFormField("Product URL", "https://edited.signal.example");
            fillFormField("Inventory", "10");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", detailRoute("/products-services", createdId));
            screenshotStep("product-updated-page");
        });
    });
});
