import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    fillFormField,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    selectFormOption,
    uploadTestImage,
    waitForDetailQuery,
} from "../support/component-tests/utils";

const assertCompanyName = (companyId: string, expectedTitle: string) => {
    cy.window().then(async (win) => {
        const response = await win.fetch(`${MAIN_SERVER_URL}/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query CompanyById($id: String!, $draft: Boolean = false) {
                    Company(id: $id, draft: $draft) {
                        name
                    }
                }`,
                variables: {
                    id: companyId,
                    draft: false,
                },
            }),
        });
        const body = (await response.json()) as {
            data?: {
                Company?: {
                    name?: string | null;
                } | null;
            };
        };

        expect(response.status).to.equal(200);
        expect(body.data?.Company?.name).to.equal(expectedTitle);
    });
};

describe("company create/edit", () => {
    it("creates a company with an uploaded image", () => {
        const companyName = "Signal Harbor Works";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Company");

        fillFormField("Company Name", companyName);
        fillFormField("Email", "signal@harbor.example");
        fillFormField("Phone", "+1 555 9001");
        fillFormField("Website", "https://signal.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/companies\/company-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created company id");
            }

            waitForDetailQuery(MAIN_SERVER_URL, "CompanyById", { id: createdId }, "Company", createdId, companyName);
            cy.contains("h1", companyName).should("be.visible");
        });
    });

    it("edits a company and keeps the update after refetch", () => {
        const companyName = "Editable Harbor Works";
        const updatedCompanyName = "Editable Harbor Works Revised";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Company");

        fillFormField("Company Name", companyName);
        fillFormField("Email", "editable@harbor.example");
        fillFormField("Website", "https://editable.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.location("pathname").should("match", /\/companies\/company-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created company id");
            }

            cy.routerNavigate(`/companies/edit/${createdId}`);
            cy.contains("h3", "Edit Company").should("be.visible");
            assertFormFieldValue("Company Name", companyName);
            assertFormFieldValue("Email", "editable@harbor.example");
            assertFormFieldValue("Website", "https://editable.harbor.example");

            fillFormField("Company Name", updatedCompanyName);
            fillFormField("Website", "https://edited.harbor.example");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", `/companies/${createdId}`);
            assertCompanyName(createdId, updatedCompanyName);
        });
    });
});
