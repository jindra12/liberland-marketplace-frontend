import { StartupForm } from "../../src/components/publish/StartupForm";
import { Startup_Stage_MutationInput } from "../../src/generated/graphql";
import type { StartupFormProps } from "../../src/components/publish/startupForm/types";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    buildTestAuthContext,
    fillFormField,
    mockOwnedCompaniesByCreatorQuery,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
    uploadTestImage,
} from "../support/component-tests/directBasic";

const mockIdentitiesQuery = () => {
    cy.intercept("POST", "**/api/graphql", (req) => {
        const body = req.body as { operationName?: string; query?: string };

        if (body.operationName === "ListIdentities" || body.query?.includes("ListIdentities")) {
            req.alias = "identities";
            req.reply({
                data: {
                    __typename: "Query",
                    Identities: {
                        __typename: "Identities",
                        docs: [
                            {
                                __typename: "Identity",
                                id: "identity-nova",
                                name: "Nova Rivers",
                            },
                            {
                                __typename: "Identity",
                                id: "identity-atlas",
                                name: "Atlas Pike",
                            },
                        ],
                        totalDocs: 2,
                        limit: 100,
                        totalPages: 1,
                        page: 1,
                        hasPrevPage: false,
                        hasNextPage: false,
                        prevPage: null,
                        nextPage: null,
                    },
                },
            });
        }

        if (body.operationName === "CreateStartup" || body.query?.includes("CreateStartup")) {
            req.alias = "createStartup";
        }

        if (body.operationName === "UpdateStartup" || body.query?.includes("UpdateStartup")) {
            req.alias = "updateStartup";
        }
    });
};

const mountStartupForm = (mode: "create" | "edit", initialValues?: StartupFormProps["initialValues"]) => {
    mountWithProviders(<StartupForm mode={mode} url={MAIN_SERVER_URL} initialValues={initialValues} />, {
        auth: buildTestAuthContext({
            isAuthenticated: true,
            user: {
                profile: {
                    sub: "user-nova",
                },
            } as never,
        }),
    });
};

describe("venture create/edit", () => {
    beforeEach(() => {
        mockOwnedCompaniesByCreatorQuery([{ id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false }]);
        mockIdentitiesQuery();
    });

    it("creates a venture with an uploaded image", () => {
        const ventureTitle = "Signal Venture";

        mountStartupForm("create");
        cy.wait("@ownedCompanies");
        cy.wait("@identities");

        fillFormField("Venture Name", ventureTitle);
        fillFormField("Description", "A venture for testing create flows.");
        selectFormOption("Company", "Harbor Labs");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Venture").click();
        cy.wait("@mediaUpload");
        cy.wait("@createStartup").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.data.title).to.equal(ventureTitle);
            expect(interception.request.body.variables.data.description).to.equal("A venture for testing create flows.");
            expect(interception.request.body.variables.data.company).to.equal("company-harbor-labs");
            expect(interception.request.body.variables.data.identity).to.equal("identity-nova");
            expect(interception.request.body.variables.data.stage).to.equal(Startup_Stage_MutationInput.Idea);
            expect(interception.request.body.variables.data.image).to.equal("media-upload-1");
        });
        screenshotStep("venture-created-form");
    });

    it("edits a venture and keeps the update after refetch", () => {
        const ventureTitle = "Editable Venture";
        const updatedVentureTitle = "Editable Venture Revised";

        mountStartupForm("edit", {
            id: "startup-editable-venture",
            title: ventureTitle,
            description: "Original venture description.",
            company: "company-harbor-labs",
            identity: "identity-nova",
            stage: Startup_Stage_MutationInput.Idea,
            existingImageId: "media-startup-editable-venture",
            existingImageUrl: "https://example.test/startup-editable-venture.png",
        });
        cy.wait("@ownedCompanies");
        cy.wait("@identities");

        assertFormFieldValue("Venture Name", ventureTitle);
        assertFormFieldValue("Description", "Original venture description.");
        assertSelectValue("Company", "Harbor Labs");
        assertSelectValue("Tribe", "Nova Rivers");
        assertSelectValue("Stage", "Idea");

        fillFormField("Venture Name", updatedVentureTitle);
        fillFormField("Description", "Updated venture description.");

        cy.get(".Publish__form").contains("button", "Publish").click();
        cy.wait("@updateStartup").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.id).to.equal("startup-editable-venture");
            expect(interception.request.body.variables.data.title).to.equal(updatedVentureTitle);
            expect(interception.request.body.variables.data.description).to.equal("Updated venture description.");
            expect(interception.request.body.variables.data.company).to.equal("company-harbor-labs");
            expect(interception.request.body.variables.data.identity).to.equal("identity-nova");
            expect(interception.request.body.variables.data.stage).to.equal(Startup_Stage_MutationInput.Idea);
        });
        screenshotStep("venture-updated-form");
    });
});
