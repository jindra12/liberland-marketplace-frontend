import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    fillFormField,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    selectFormOption,
    uploadTestImage,
    waitForDetailQuery,
} from "../support/component-tests/utils";

const assertStartupTitle = (startupId: string, expectedTitle: string) => {
    cy.window().then(async (win) => {
        const response = await win.fetch(`${MAIN_SERVER_URL}/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query StartupById($id: String!, $draft: Boolean = false) {
                    Startup(id: $id, draft: $draft) {
                        title
                    }
                }`,
                variables: {
                    id: startupId,
                    draft: false,
                },
            }),
        });
        const body = (await response.json()) as {
            data?: {
                Startup?: {
                    title?: string | null;
                } | null;
            };
        };

        expect(response.status).to.equal(200);
        expect(body.data?.Startup?.title).to.equal(expectedTitle);
    });
};

describe("venture create/edit", () => {
    it("creates a venture with an uploaded image", () => {
        const ventureTitle = "Signal Venture";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Venture");

        fillFormField("Venture Name", ventureTitle);
        fillFormField("Description", "A venture for testing create flows.");
        selectFormOption("Company", "Harbor Labs");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Venture").click();
        cy.wait("@mediaUpload");
        cy.location("pathname").should("match", /\/ventures\/startup-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created venture id");
            }

            waitForDetailQuery(MAIN_SERVER_URL, "StartupById", { id: createdId }, "Startup", createdId, ventureTitle);
            cy.contains("h1", ventureTitle).should("be.visible");
        });
    });

    it("edits a venture and keeps the update after refetch", () => {
        const ventureTitle = "Editable Venture";
        const updatedVentureTitle = "Editable Venture Revised";

        mountAuthenticatedMainRoute("/publish");
        openPublishCategory("Venture");

        fillFormField("Venture Name", ventureTitle);
        fillFormField("Description", "Original venture description.");
        selectFormOption("Company", "Harbor Labs");
        selectFormOption("Tribe", "Nova Rivers");
        uploadTestImage();

        cy.contains("button", "Publish Venture").click();
        cy.location("pathname").should("match", /\/ventures\/startup-/);
        cy.location("pathname").then((pathname) => {
            const createdId = pathname.split("/").filter(Boolean).pop();
            if (createdId === undefined) {
                throw new Error("Missing created venture id");
            }

            cy.routerNavigate(`/ventures/edit/${createdId}`);
            cy.contains("h3", "Edit Venture").should("be.visible");
            assertFormFieldValue("Venture Name", ventureTitle);
            assertSelectValue("Company", "Harbor Labs");
            assertSelectValue("Tribe", "Nova Rivers");
            assertSelectValue("Stage", "Idea");

            fillFormField("Venture Name", updatedVentureTitle);
            selectFormOption("Stage", "MVP");
            fillFormField("Description", "Updated venture description.");
            uploadTestImage();

            cy.get(".Publish__form").contains("button", "Publish").click();
            cy.wait("@mediaUpload");
            cy.location("pathname").should("eq", `/ventures/${createdId}`);
            assertStartupTitle(createdId, updatedVentureTitle);
        });
    });
});
