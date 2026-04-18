import { buildSeoDescription } from "../../src/components/publish/postForm/utils";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    fillFormField,
    mountAuthenticatedMainRoute,
    openPublishCategory,
    screenshotStep,
} from "../support/component-tests/utils";

const selectOwnedCompany = (companyName: string) => {
    cy.contains(".ant-form-item", "Company").find("input").click({ force: true });
    cy.contains(".ant-drawer-title", "Select company", { timeout: 20000 }).should("be.visible");
    cy.contains(".Publish__companyFieldItem", companyName, { timeout: 20000 }).click();
};

const openPostPublishForm = () => {
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

            cy.routerNavigate(`/posts/${createdId}`);
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(initialTitle);
            });
            cy.contains("h1", initialTitle).should("be.visible");
            cy.contains(".PostDetail__content", "Harbor launch notes with markdown and a link.").should("be.visible");

            cy.routerNavigate(`/posts/edit/${createdId}`);
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(initialTitle);
            });
            cy.contains("h3", "Edit Post", { timeout: 20000 }).should("be.visible");
            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", initialTitle);
            assertFormFieldValue("Content", initialContent);
            assertFormFieldValue("SEO Description", initialSeoDescription);
            assertFormFieldValue("Company", "Harbor Labs");

            fillFormField("Title", updatedTitle);
            fillFormField("Content", updatedContent);
            cy.get(".Publish__form").contains("button", "Publish").click();

            cy.wait("@updatePost").then((updateInterception) => {
                expect(updateInterception.response?.statusCode).to.equal(200);
                expect(updateInterception.request.body.variables.id).to.equal(createdId);
                expect(updateInterception.request.body.variables.data.title).to.equal(updatedTitle);
                expect(updateInterception.request.body.variables.data.content).to.equal(updatedContent);
            });

            cy.routerNavigate(`/posts/${createdId}`);
            cy.wait("@detailPost").then((detailInterception) => {
                expect(detailInterception.response?.statusCode).to.equal(200);
                expect(detailInterception.response?.body?.data?.Post?.id).to.equal(createdId);
                expect(detailInterception.response?.body?.data?.Post?.title).to.equal(updatedTitle);
            });

            cy.routerNavigate(`/posts/edit/${createdId}`);
            cy.contains("h3", "Edit Post", { timeout: 20000 }).should("be.visible");
            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", updatedTitle);
            assertFormFieldValue("Content", updatedContent);
            assertFormFieldValue("SEO Description", updatedSeoDescription);
            screenshotStep("posts-created-and-updated");
        });
    });

    it("deletes a post", () => {
        mountAuthenticatedMainRoute("/posts/post-1");
        cy.contains("h1", "Harbor Launch Notes", { timeout: 20000 }).should("be.visible");
        cy.contains(".PostDetail button", "Delete", { timeout: 20000 }).should("be.visible").click();
        cy.contains(".ant-popconfirm", "Delete this post?", { timeout: 20000 }).within(() => {
            cy.contains("button", "Delete").click();
        });

        cy.location("pathname").should("eq", "/posts");
        cy.contains(".PostList", "Harbor Launch Notes").should("not.exist");
        screenshotStep("posts-deleted");
    });
});
