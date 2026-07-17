import dayjs from "dayjs";

import { Job_EmploymentType_MutationInput } from "../../src/generated/graphql";
import { JobForm } from "../../src/components/publish/JobForm";
import type { JobFormProps } from "../../src/components/publish/JobForm";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    buildTestAuthContext,
    fillFormField,
    mountWithProviders,
    mockOwnedCompaniesByCreatorQuery,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
} from "../support/component-tests/directBasic";

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

const mountJobForm = (initialValues?: JobFormProps["initialValues"]) => {
    mountWithProviders(<JobForm mode="create" url={MAIN_SERVER_URL} initialValues={initialValues} />, {
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

const mountEditJobForm = (initialValues?: JobFormProps["initialValues"]) => {
    mountWithProviders(<JobForm mode="edit" url={MAIN_SERVER_URL} initialValues={initialValues} />, {
        auth: buildTestAuthContext({
            isAuthenticated: true,
            user: {
                profile: {
                    sub: "user-nova",
                },
            } as never,
        }),
        route: "/jobs/edit/job-editable-dock-crew",
    });
};

describe("job create/edit", () => {
    beforeEach(() => {
        mockOwnedCompaniesByCreatorQuery([
            { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
            { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
        ]);
        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "CreateJob" || body.query?.includes("CreateJob")) {
                req.alias = "createJob";
            }

            if (body.operationName === "UpdateJob" || body.query?.includes("UpdateJob")) {
                req.alias = "updateJob";
            }
        });
    });

    it("hides private companies in the company selector", () => {
        mountJobForm();
        cy.wait("@ownedCompanies");

        cy.get(".Publish__jobCompanyField").find(".ant-select").click();
        cy.get(".ant-select-dropdown")
            .should("be.visible")
            .and("contain.text", "Harbor Labs")
            .and("not.contain.text", "Reef Studio")
            .and("not.contain.text", "Fourfold One");
    });

    it("creates a job with an uploaded image", () => {
        const jobTitle = "Harbor Shift Coordinator";

        mountJobForm();
        cy.wait("@ownedCompanies");

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Full-time");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "Harbor City");
        fillFormField("Apply URL", "https://harbor.example/jobs/shift-coordinator");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.wait("@mediaUpload");
        cy.wait("@createJob").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.data.title).to.equal(jobTitle);
            expect(interception.request.body.variables.data.positions).to.equal(2);
            expect(interception.request.body.variables.data.location).to.equal("Harbor City");
            expect(interception.request.body.variables.data.applyUrl).to.equal("https://harbor.example/jobs/shift-coordinator");
        });
        cy.location("pathname").should("match", /\/jobs\/job-[^/]+\/[a-f0-9]+$/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            assertJobTitle(createdId, jobTitle);
            screenshotStep("job-created-form");
        });
    });

    it("edits a job and keeps the update after refetch", () => {
        const jobTitle = "Editable Dock Crew";
        const updatedJobTitle = "Editable Dock Crew Revised";

        mountJobForm();
        cy.wait("@ownedCompanies");

        fillFormField("Title", jobTitle);
        selectFormOption("Employment Type", "Contract");
        selectFormOption("Company", "Harbor Labs");
        fillFormField("Positions", "2");
        fillFormField("Location", "North Port");
        uploadTestImage();

        cy.contains("button", "Publish Job").click();
        cy.wait("@mediaUpload");
        cy.wait("@createJob").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });

        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/")[2];
            mountEditJobForm({
                id: createdId,
                title: jobTitle,
                employmentType: Job_EmploymentType_MutationInput.Contract,
                positions: 2,
                postedAt: dayjs("2026-01-01"),
                location: "North Port",
                company: "company-harbor-labs",
            });

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
            cy.wait("@updateJob").then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
                expect(interception.request.body.variables.id).to.equal(createdId);
                expect(interception.request.body.variables.data.title).to.equal(updatedJobTitle);
                expect(interception.request.body.variables.data.positions).to.equal(3);
                expect(interception.request.body.variables.data.location).to.equal("Harbor City");
            });
            cy.location("pathname").should("match", new RegExp(`/jobs/${createdId}/[a-f0-9]+$`));
            assertJobTitle(createdId, updatedJobTitle);
            screenshotStep("job-updated-form");
        });
    });
});
