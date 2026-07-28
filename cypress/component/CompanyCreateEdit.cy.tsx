import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    fillFormField,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
} from "../support/component-tests/directBasic";
import { CompanyForm } from "../../src/components/publish/CompanyForm";
import type { CompanyFormProps } from "../../src/components/publish/CompanyForm";

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

const mountCompanyForm = (mode: "create" | "edit", initialValues?: CompanyFormProps["initialValues"]) => {
    mountWithProviders(<CompanyForm mode={mode} url={MAIN_SERVER_URL} initialValues={initialValues} />, {
        route: "/publish",
    });
};

describe("company create/edit", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "CreateCompany" || body.query?.includes("CreateCompany")) {
                req.alias = "createCompany";
            }

            if (body.operationName === "UpdateCompany" || body.query?.includes("UpdateCompany")) {
                req.alias = "updateCompany";
            }
        });
    });

    it("creates a company with an uploaded image", () => {
        const companyName = "Signal Harbor Works";

        mountCompanyForm("create");

        fillFormField("Company Name", companyName);
        fillFormField("Email", "signal@harbor.example");
        fillFormField("Phone", "+1 555 9001");
        fillFormField("Website", "https://signal.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.wait("@mediaUpload");
        cy.wait("@createCompany").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.data.name).to.equal(companyName);
            expect(interception.request.body.variables.data.email).to.equal("signal@harbor.example");
            expect(interception.request.body.variables.data.phone).to.equal("+1 555 9001");
            expect(interception.request.body.variables.data.website).to.equal("https://signal.harbor.example");
        });
        cy.location("pathname").should("match", /\/companies\/company-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            assertCompanyName(createdId, companyName);
            screenshotStep("company-created-form");
        });
    });

    it("edits a company and keeps the update after refetch", () => {
        const companyName = "Editable Harbor Works";
        const updatedCompanyName = "Editable Harbor Works Revised";

        mountCompanyForm("create");

        fillFormField("Company Name", companyName);
        fillFormField("Email", "editable@harbor.example");
        fillFormField("Website", "https://editable.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.wait("@mediaUpload");
        cy.wait("@createCompany").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });

        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            mountCompanyForm("edit", {
                id: createdId,
                name: companyName,
                email: "editable@harbor.example",
                website: "https://editable.harbor.example",
                identity: "identity-nova",
            });

            assertFormFieldValue("Company Name", companyName);
            assertFormFieldValue("Email", "editable@harbor.example");
            assertFormFieldValue("Website", "https://editable.harbor.example");

            fillFormField("Company Name", updatedCompanyName);
            fillFormField("Website", "https://edited.harbor.example");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.wait("@updateCompany").then((updateInterception) => {
                expect(updateInterception.response?.statusCode).to.equal(200);
                expect(updateInterception.request.body.variables.id).to.equal(createdId);
                expect(updateInterception.request.body.variables.data.name).to.equal(updatedCompanyName);
                expect(updateInterception.request.body.variables.data.website).to.equal("https://edited.harbor.example");
            });
            cy.location("pathname").should("match", new RegExp(`/companies/${createdId}/[a-f0-9]+$`));
            assertCompanyName(createdId, updatedCompanyName);
            screenshotStep("company-updated-form");
        });
    });
});
