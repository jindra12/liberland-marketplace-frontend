import { ProductForm } from "../../src/components/publish/ProductForm";
import type { ProductFormProps } from "../../src/components/publish/ProductForm";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    buildTestAuthContext,
    fillFormField,
    mockOwnedCompaniesByCreatorQuery,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
} from "../support/component-tests/directBasic";

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

const mountProductForm = (mode: "create" | "edit", initialValues?: ProductFormProps["initialValues"]) => {
    mockOwnedCompaniesByCreatorQuery([
        { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
        { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
    ]);

    mountWithProviders(<ProductForm mode={mode} url={MAIN_SERVER_URL} initialValues={initialValues} />, {
        auth: buildTestAuthContext({
            isAuthenticated: true,
            user: {
                profile: {
                    sub: "user-nova",
                },
            } as never,
        }),
        route: "/publish",
    });
};

describe("product create/edit", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "CreateProduct" || body.query?.includes("CreateProduct")) {
                req.alias = "createProduct";
            }

            if (body.operationName === "UpdateProduct" || body.query?.includes("UpdateProduct")) {
                req.alias = "updateProduct";
            }
        });
    });

    it("creates a product with an uploaded image", () => {
        const productName = "Signal Beacon";

        mountProductForm("create");
        cy.wait("@ownedCompanies");

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "79");
        fillFormField("Product URL", "https://signal.beacon.example");
        fillFormField("Inventory", "12");
        selectFormOption("Company", "Harbor Labs");
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.wait("@mediaUpload");
        cy.wait("@createProduct").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.data.name).to.equal(productName);
            expect(interception.request.body.variables.data.priceInUSD).to.equal(7900);
            expect(interception.request.body.variables.data.url).to.equal("https://signal.beacon.example");
            expect(interception.request.body.variables.data.inventory).to.equal(12);
        });
        cy.location("pathname").should("match", /\/products-services\/product-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            assertProductTitle(createdId, productName);
            screenshotStep("product-created-form");
        });
    });

    it("edits a product and keeps the update after refetch", () => {
        const productName = "Editable Signal Lamp";
        const updatedProductName = "Editable Signal Lamp Revised";

        mountProductForm("create");
        cy.wait("@ownedCompanies");

        fillFormField("Product Name", productName);
        fillFormField("Price (USD)", "49");
        fillFormField("Product URL", "https://editable.signal.example");
        fillFormField("Inventory", "7");
        selectFormOption("Company", "Harbor Labs");
        uploadTestImage();

        cy.contains("button", "Publish Product").click();
        cy.wait("@mediaUpload");
        cy.wait("@createProduct").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });

        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            mountProductForm("edit", {
                id: createdId,
                name: productName,
                priceInUSD: "49",
                url: "https://editable.signal.example",
                inventory: 7,
                company: "company-harbor-labs",
            });

            assertFormFieldValue("Product Name", productName);
            assertFormFieldValue("Price (USD)", "49");
            assertFormFieldValue("Product URL", "https://editable.signal.example");
            assertFormFieldValue("Inventory", "7");

            fillFormField("Product Name", updatedProductName);
            fillFormField("Price (USD)", "89");
            fillFormField("Product URL", "https://edited.signal.example");
            fillFormField("Inventory", "10");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.wait("@updateProduct").then((updateInterception) => {
                expect(updateInterception.response?.statusCode).to.equal(200);
                expect(updateInterception.request.body.variables.id).to.equal(createdId);
                expect(updateInterception.request.body.variables.data.name).to.equal(updatedProductName);
                expect(updateInterception.request.body.variables.data.priceInUSD).to.equal(8900);
                expect(updateInterception.request.body.variables.data.url).to.equal("https://edited.signal.example");
                expect(updateInterception.request.body.variables.data.inventory).to.equal(10);
            });
            cy.location("pathname").should("match", new RegExp(`/products-services/${createdId}/[a-f0-9]+$`));
            assertProductTitle(createdId, updatedProductName);
            screenshotStep("product-updated-form");
        });
    });
});
