import { detailRoute, editRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    fillFormField,
    getRouteEntityId,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
    waitForDetailQuery,
} from "../support/component-tests/utils";

const assertJobTitle = (jobId: string, expectedTitle: string) => {
    cy.window().then(async (win) => {
        const response = await win.fetch(`${MAIN_SERVER_URL}/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query JobById($id: String!, $draft: Boolean = false) {
                    Job(id: $id, draft: $draft) {
                        title
                    }
                }`,
                variables: {
                    id: jobId,
                    draft: false,
                },
            }),
        });
        const body = (await response.json()) as {
            data?: {
                Job?: {
                    title?: string | null;
                } | null;
            };
        };

        expect(response.status).to.equal(200);
        expect(body.data?.Job?.title).to.equal(expectedTitle);
    });
};

const openJobPublishForm = () => {
    mockOwnedCompaniesByCreatorQuery([
        { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
        { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
    ]);
    mountAuthenticatedMainRoute("/publish");
    openPublishCategory("Job");
};

describe("job create/edit", () => {
    it("hides private companies in the company selector", () => {
        openJobPublishForm();

        cy.get(".Publish__jobCompanyField").find(".ant-select").click();
        cy.get(".ant-select-dropdown", { timeout: 20000 })
            .should("be.visible")
            .and("contain.text", "Harbor Labs")
            .and("not.contain.text", "Reef Studio")
            .and("not.contain.text", "Fourfold One");
    });

    it("creates a job with an uploaded image", () => {
        const jobTitle = "Harbor Shift Coordinator";

        openJobPublishForm();

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Full-time");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "Harbor City");
        fillFormField("Apply URL", "https://harbor.example/jobs/shift-coordinator");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/jobs\/job-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            waitForDetailQuery(MAIN_SERVER_URL, "JobById", { id: createdId }, "Job", createdId, jobTitle);
            cy.contains("h1", jobTitle).should("be.visible");
            screenshotStep("job-created-page");
        });
    });

    it("edits a job and keeps the update after refetch", () => {
        const jobTitle = "Editable Dock Crew";
        const updatedJobTitle = "Editable Dock Crew Revised";

        openJobPublishForm();

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Contract");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "North Port");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.location("pathname").should("match", /\/jobs\/job-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = getRouteEntityId(pathname);
            cy.routerNavigate(editRoute("/jobs", createdId));
            cy.contains("h3", "Edit Job").should("be.visible");
            assertFormFieldValue("Title", jobTitle);
            assertSelectValue("Employment Type", "Contract");
            assertSelectValue("Company", "Harbor Labs");
            assertFormFieldValue("Positions", "2");
            assertFormFieldValue("Location", "North Port");

            fillFormField("Title", updatedJobTitle);
            fillFormField("Positions", "3");
            fillFormField("Location", "Harbor City");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", detailRoute("/jobs", createdId));
            assertJobTitle(createdId, updatedJobTitle);
            screenshotStep("job-updated-page");
        });
    });
});
