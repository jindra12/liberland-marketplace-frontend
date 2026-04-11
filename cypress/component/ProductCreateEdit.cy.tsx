import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    fillFormField,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
} from "../support/component-tests/utils";

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
    mountAuthenticatedMainRoute("/publish");
    openPublishCategory("Company");

    fillFormField("Company Name", companyName);
    selectFormOption("Tribe", "Nova Rivers");
    uploadTestImage();

    cy.get(".Publish__form").contains("button", "Publish Company").click();
    cy.wait("@mediaUpload");
    cy.location("pathname").should("match", /\/companies\/company-/);
    cy.contains("h1", companyName).should("be.visible");
    screenshotStep("owned-company-created");
};

describe("product create/edit", () => {
    it("creates a product with an uploaded image", () => {
        const productName = "Signal Beacon";
        const ownedCompanyName = "Editable Harbor Labs";

        createOwnedCompany(ownedCompanyName);
        cy.routerNavigate("/publish");
        openPublishCategory("Product");

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "79");
        fillFormField("Product URL", "https://signal.beacon.example");
        fillFormField("Inventory", "12");
        selectFormOption("Company", ownedCompanyName);
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/products-services\/product-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created product id");
            }

            cy.contains("h1", productName).should("be.visible");
            screenshotStep("product-created-page");
        });
    });

    it("edits a product and keeps the update after refetch", () => {
        const productName = "Editable Signal Lamp";
        const updatedProductName = "Editable Signal Lamp Revised";
        const ownedCompanyName = "Editable Harbor Labs";

        createOwnedCompany(ownedCompanyName);
        cy.routerNavigate("/publish");
        openPublishCategory("Product");

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "49");
        fillFormField("Product URL", "https://editable.signal.example");
        fillFormField("Inventory", "7");
        selectFormOption("Company", ownedCompanyName);
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.location("pathname").should("match", /\/products-services\/product-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created product id");
            }

            cy.routerNavigate(`/products-services/edit/${createdId}`);
            cy.contains("h3", "Edit Product").should("be.visible");
            assertFormFieldValue("Product Name", productName);
            assertFormFieldValue("Price (USD)", "49");
            assertSelectValue("Company", ownedCompanyName);
            assertFormFieldValue("Product URL", "https://editable.signal.example");
            assertFormFieldValue("Inventory", "7");

            fillFormField("Product Name", updatedProductName);
            fillFormField("Price (USD)", "89");
            fillFormField("Product URL", "https://edited.signal.example");
            fillFormField("Inventory", "10");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", `/products-services/${createdId}`);
            assertProductTitle(createdId, updatedProductName);
            screenshotStep("product-updated-page");
        });
    });
});
