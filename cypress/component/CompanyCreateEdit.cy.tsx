import { MAIN_SERVER_URL, editRoute, detailRoute } from "../support/component-tests/constants";
import {
    dismissNsfwModal,
    assertFormFieldValue,
    fillFormField,
    getRouteEntityId,
    mountAuthenticatedMainRoute,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
    waitForDetailQuery,
} from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

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

const openCompanyPublishForm = () => {
    cy.get("body", { timeout: 30000 }).should(($body) => {
        expect($body.find(".Publish__category, .Publish__companyNameField").length).to.be.greaterThan(0);
    });
    cy.get("body").then(($body) => {
        if ($body.find(".Publish__category").length > 0) {
            cy.contains(".Publish__category", "Company", { timeout: 30000 }).should("be.visible").click({ force: true });
            return;
        }

        cy.contains(".Publish__companyNameField", "Company Name", { timeout: 30000 }).should("be.visible");
    });
};

describe("company create/edit", () => {
    it("creates a company with an uploaded image", () => {
        const companyName = "Signal Harbor Works";
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedMainRoute("/publish", true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        dismissNsfwModal();
        openCompanyPublishForm();

        fillFormField("Company Name", companyName);
        fillFormField("Email", "signal@harbor.example");
        fillFormField("Phone", "+1 555 9001");
        fillFormField("Website", "https://signal.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/companies\/company-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            waitForDetailQuery(MAIN_SERVER_URL, "CompanyById", { id: createdId }, "Company", createdId, companyName);
            cy.contains("h1", companyName).should("be.visible");
            assertCompanyName(createdId, companyName);
            screenshotStep("company-created-page");
        });
    });

    it("edits a company and keeps the update after refetch", () => {
        const companyName = "Editable Harbor Works";
        const updatedCompanyName = "Editable Harbor Works Revised";
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        mountAuthenticatedMainRoute("/publish", true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        dismissNsfwModal();
        openCompanyPublishForm();

        fillFormField("Company Name", companyName);
        fillFormField("Email", "editable@harbor.example");
        fillFormField("Website", "https://editable.harbor.example");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Company").click();
        cy.location("pathname").should("match", /\/companies\/company-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            cy.routerNavigate(editRoute("/companies", createdId));
            cy.contains("h3", "Edit Company").should("be.visible");
            assertFormFieldValue("Company Name", companyName);
            assertFormFieldValue("Email", "editable@harbor.example");
            assertFormFieldValue("Website", "https://editable.harbor.example");

            fillFormField("Company Name", updatedCompanyName);
            fillFormField("Website", "https://edited.harbor.example");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", detailRoute("/companies", createdId));
            assertCompanyName(createdId, updatedCompanyName);
            screenshotStep("company-updated-page");
        });
    });
});
