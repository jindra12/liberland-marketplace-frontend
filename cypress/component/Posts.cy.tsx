import { buildSeoDescription } from "../../src/components/publish/postForm/utils";
import { PostForm } from "../../src/components/publish/PostForm";
import PostDetail from "../../src/components/detail/PostDetail";
import type { PostFormProps } from "../../src/components/publish/PostForm";
import { Route, Routes } from "react-router-dom";

import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    assertSelectValue,
    buildTestAuthContext,
    fillFormField,
    mockOwnedCompaniesByCreatorQuery,
    mountWithProviders,
    selectFormOption,
    screenshotStep,
} from "../support/component-tests/directBasic";

const mountPostForm = (mode: "create" | "edit", initialValues?: PostFormProps["initialValues"]) => {
    mockOwnedCompaniesByCreatorQuery([
        { id: "company-harbor-labs", name: "Harbor Labs", isPrivate: false },
        { id: "company-reef-studio", name: "Reef Studio", isPrivate: true },
    ]);
    mountWithProviders(<PostForm mode={mode} url={MAIN_SERVER_URL} initialValues={initialValues} />, {
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
    cy.wait("@ownedCompanies");
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

        mountPostForm("create");
        fillFormField("Title", initialTitle);
        fillFormField("Content", initialContent);
        selectFormOption("Company", "Harbor Labs");
        cy.contains(".Publish__form button", "Publish Post").click();

        cy.wait("@createPost").then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            const createdId = interception.response?.body?.data?.createPost?.id;
            if (createdId === undefined) {
                throw new Error("Missing created post id");
            }

            cy.location("pathname").should("match", /\/posts\/post-[^/]+\/[a-f0-9]+$/);
            mountPostForm("edit", {
                id: createdId,
                title: initialTitle,
                content: initialContent,
                seoDescription: initialSeoDescription,
                company: "company-harbor-labs",
                slug: "harbor-launch-notes",
            });

            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", initialTitle);
            cy.get(".Publish__postContentField").find(".w-md-editor-text-input").should("have.value", initialContent);
            cy.get(".Publish__postDescriptionField textarea").should("have.value", initialSeoDescription);
            assertSelectValue("Company", "Harbor Labs");

            fillFormField("Title", updatedTitle);
            fillFormField("Content", updatedContent);
            cy.get(".Publish__form").contains("button", "Publish").click();

            cy.wait("@updatePost").then((updateInterception) => {
                expect(updateInterception.response?.statusCode).to.equal(200);
                expect(updateInterception.request.body.variables.id).to.equal(createdId);
                expect(updateInterception.request.body.variables.data.title).to.equal(updatedTitle);
                expect(updateInterception.request.body.variables.data.content).to.equal(updatedContent);
                expect(updateInterception.request.body.variables.data.meta.description).to.equal(updatedSeoDescription);
            });

            cy.get(".w-md-editor-toolbar").should("have.css", "display", "flex");
            cy.get(".w-md-editor-text").should("have.css", "padding-top", "10px");
            assertFormFieldValue("Title", updatedTitle);
            cy.get(".Publish__postContentField").find(".w-md-editor-text-input").should("have.value", updatedContent);
            screenshotStep("posts-created-and-updated");
        });
    });

    it("allows selecting a private company in the post form", () => {
        mountPostForm("create");

        fillFormField("Title", "Private Harbor Update");
        fillFormField("Content", "Private post content.");
        selectFormOption("Company", "Reef Studio");

        assertSelectValue("Company", "Reef Studio");
    });

    it("deletes a post", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (typeof req.body.query === "string" && req.body.query.includes("PostById")) {
                req.alias = "postById";
            }

            if (typeof req.body.query === "string" && req.body.query.includes("DeletePost")) {
                req.alias = "deletePost";
            }
        });

        mountWithProviders(
            <Routes>
                <Route path="/posts/:id/:serverUrl" element={<PostDetail />} />
            </Routes>,
            {
                auth: buildTestAuthContext({
                    isAuthenticated: true,
                    user: {
                        profile: {
                            sub: "user-nova",
                        },
                    } as never,
                }),
                route: detailRoute("/posts", "post-harbor-operations-digest"),
            },
        );

        cy.wait("@postById");
        cy.contains("h1", "Harbor Operations Digest").should("be.visible");
        cy.contains(".PostDetail button", "Delete").should("be.visible").click();
        cy.contains(".ant-popconfirm", "Delete this post?").within(() => {
            cy.contains("button", "Delete").click();
        });

        cy.wait("@deletePost");

        cy.location("pathname").should("eq", "/posts");
        cy.contains(".PostList", "Harbor Operations Digest").should("not.exist");
        screenshotStep("posts-deleted");
    });
});
