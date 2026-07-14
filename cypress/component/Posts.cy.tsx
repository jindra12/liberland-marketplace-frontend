import { buildSeoDescription } from "../../src/components/publish/postForm/utils";

import { detailRoute, editRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    fillFormField,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    mockOwnedCompaniesByCreatorQuery,
    selectFormOption,
    screenshotStep,
} from "../support/component-tests/utils";

const selectOwnedCompany = (companyName: string) => {
    selectFormOption("Company", companyName);
};

const openPostPublishForm = () => {
    mockOwnedCompaniesByCreatorQuery([
        { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
        { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
    ]);
    mountAuthenticatedMainRoute("/publish");
    openPublishCategory("Post");
};

describe("posts", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        cy.on("uncaught:exception", (error) => {
            if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
                return false;
            }

            return undefined;
        });
    });

    it("creates and updates a post", () => {
        const initialTitle = "Harbor Launch Notes";
        const initialContent = "Harbor launch notes with **markdown** and a [link](https://harbor.example).";
        const updatedTitle = "Harbor Launch Notes Revised";
        const updatedContent = "Updated harbor notes with a new paragraph and *formatting*.";
        const initialSeoDescription = buildSeoDescription(initialContent);
        const updatedSeoDescription = buildSeoDescription(updatedContent);

        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (typeof req.body.query === "string" && req.body.query.includes("CreatePost")) {
                req.alias = "createPost";
            }

            if (typeof req.body.query === "string" && req.body.query.includes("UpdatePost")) {
                req.alias = "updatePost";
            }
        });

        openPostPublishForm();
        fillFormField("Title", initialTitle);
        fillFormField("Content", initialContent);
        selectOwnedCompany("Harbor Labs");
        cy.contains(".Publish__form button", "Publish Post").click();

        cy.wait("@createPost").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            const createdId = interception.response?.body?.data?.createPost?.id;
            if (createdId === undefined) {
                throw new Error("Missing created post id");
            }

            cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
                if (typeof req.body.query === "string" && req.body.query.includes("PostById")) {
                    req.alias = "detailPost";
                }
            });

            cy.routerNavigate(detailRoute("/posts", createdId));
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(initialTitle);
            });
            cy.contains("h1", initialTitle).should("be.visible");
            cy.contains(".PostDetail__content", "Harbor launch notes with markdown and a link.").should("be.visible");

            cy.routerNavigate(editRoute("/posts", createdId));
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(initialTitle);
            });
            cy.contains("h3", "Edit Post").should("be.visible");
            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", initialTitle);
            assertFormFieldValue("Content", initialContent);
            assertFormFieldValue("Description", initialSeoDescription);
            assertSelectValue("Company", "Harbor Labs");

            fillFormField("Title", updatedTitle);
            fillFormField("Content", updatedContent);
            cy.get(".Publish__form").contains("button", "Publish").click();

            cy.wait("@updatePost").then((updateInterception) => {
                expect(updateInterception.response?.statusCode).to.equal(200);
                expect(updateInterception.request.body.variables.id).to.equal(createdId);
                expect(updateInterception.request.body.variables.data.title).to.equal(updatedTitle);
                expect(updateInterception.request.body.variables.data.content).to.equal(updatedContent);
            });

            cy.routerNavigate(detailRoute("/posts", createdId));
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(updatedTitle);
            });

            cy.routerNavigate(editRoute("/posts", createdId));
            cy.contains("h3", "Edit Post").should("be.visible");
            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", updatedTitle);
            assertFormFieldValue("Content", updatedContent);
            assertFormFieldValue("Description", updatedSeoDescription);
            screenshotStep("posts-created-and-updated");
        });
    });

    it("allows selecting a private company in the post form", () => {
        openPostPublishForm();

        fillFormField("Title", "Private Harbor Update");
        fillFormField("Content", "Private post content.");
        selectFormOption("Company", "Reef Studio");

        assertSelectValue("Company", "Reef Studio");
    });

    it("deletes a post", () => {
        mountAuthenticatedMainRoute(detailRoute("/posts", "post-1"));
        cy.contains("h1", "Harbor Launch Notes").should("be.visible");
        cy.contains(".PostDetail button", "Delete").should("be.visible").click();
        cy.contains(".ant-popconfirm", "Delete this post?").within(() => {
            cy.contains("button", "Delete").click();
        });

        cy.location("pathname").should("eq", "/posts");
        cy.contains(".PostList", "Harbor Launch Notes").should("not.exist");
        screenshotStep("posts-deleted");
    });
});
