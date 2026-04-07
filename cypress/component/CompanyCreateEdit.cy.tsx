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
            cy.contains("h1", updatedCompanyName).should("be.visible");
        });
    });
});
