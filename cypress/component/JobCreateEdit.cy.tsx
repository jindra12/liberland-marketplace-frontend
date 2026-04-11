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

describe("job create/edit", () => {
    it("creates a job with an uploaded image", () => {
        const jobTitle = "Harbor Shift Coordinator";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Job");

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Full-time");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "Harbor City");
        fillFormField("Apply URL", "https://harbor.example/jobs/shift-coordinator");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/jobs\/job-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created job id");
            }

            waitForDetailQuery(MAIN_SERVER_URL, "JobById", { id: createdId }, "Job", createdId, jobTitle);
            cy.contains("h1", jobTitle).should("be.visible");
            screenshotStep("job-created-page");
        });
    });

    it("edits a job and keeps the update after refetch", () => {
        const jobTitle = "Editable Dock Crew";
        const updatedJobTitle = "Editable Dock Crew Revised";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Job");

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Contract");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "North Port");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.location("pathname").should("match", /\/jobs\/job-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created job id");
            }

            cy.routerNavigate(`/jobs/edit/${createdId}`);
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
            cy.location("pathname").should("eq", `/jobs/${createdId}`);
            assertJobTitle(createdId, updatedJobTitle);
            screenshotStep("job-updated-page");
        });
    });
});
