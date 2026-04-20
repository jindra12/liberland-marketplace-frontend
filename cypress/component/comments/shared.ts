import { Comment_ReplyPostRelationshipInputRelationTo } from "../../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION, ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../../src/constants";

import { MAIN_SERVER_URL } from "../../support/component-tests/constants";
import { gqlAlias, mountAuthenticatedMainRoute } from "../../support/component-tests/utils";
import type { GraphQLVariables } from "../../support/component-tests/types";

export const DESKTOP_VIEWPORT = {
    width: 1280,
    height: 1200,
    name: "desktop",
} as const;

export const MOBILE_VIEWPORT = {
    width: 390,
    height: 844,
    name: "mobile",
} as const;

export type ViewportConfig = typeof DESKTOP_VIEWPORT | typeof MOBILE_VIEWPORT;

export const runOnViewport = (viewport: ViewportConfig, run: () => void) => {
    cy.viewport(viewport.width, viewport.height);
    run();
};

export const installCommentSpecExceptionGuard = () => {
    cy.on("uncaught:exception", (error) => {
        if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
            return false;
        }

        return undefined;
    });
};

export const selectCommentCompany = (containerSelector: string, companyName: string) => {
    cy.contains(containerSelector, "Author company").find("input").click({ force: true });
    cy.contains(".ant-drawer-title", "Select company", { timeout: 20000 }).should("be.visible");
    cy.contains(".Publish__companyFieldItem", companyName, { timeout: 20000 }).click();
    cy.contains(".ant-drawer-title", "Select company", { timeout: 20000 }).should("not.exist");
};

export const assertCommentCompanyValue = (containerSelector: string, companyName: string) => {
    cy.contains(containerSelector, "Author company").find("input").should("have.value", companyName);
};

export const assertCommentTextValue = (containerSelector: string, text: string) => {
    cy.get(containerSelector).find("textarea").first().should("have.value", text);
};

export const fillCommentText = (containerSelector: string, text: string) => {
    cy.get(containerSelector).find("textarea").first().clear({ force: true }).type(text, { force: true });
};

export const openCommentCardAction = (commentText: string, actionLabel: string) => {
    cy.contains(".CommentCard", commentText).should("be.visible").within(() => {
        cy.contains("button", actionLabel).click();
    });
};

export const waitForCollectionRequest = (
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedTitle: string,
    minimumDocs = 1,
) => {
    cy.wait(`@${gqlAlias(MAIN_SERVER_URL, operationName, expectedVariables)}`, { timeout: 20000 }).then((interception) => {
        const response = interception.response?.body as {
            data?: Record<string, { docs?: Array<{ title?: string; name?: string; content?: string }> }>;
        } | undefined;
        const collection = response?.data?.[responseKey];

        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.at.least(minimumDocs);
        if (minimumDocs > 0) {
            expect(collection?.docs?.[0]?.title ?? collection?.docs?.[0]?.name ?? collection?.docs?.[0]?.content).to.equal(
                expectedTitle,
            );
        }
    });
};

export const waitForDetailRequest = (
    operationName: string,
    expectedVariables: GraphQLVariables,
    expectedTitle: string,
) => {
    cy.wait(`@${gqlAlias(MAIN_SERVER_URL, operationName, expectedVariables)}`, { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        cy.contains("h1", expectedTitle, { timeout: 20000 }).should("be.visible");
    });
};

const mountPostDetail = () => {
    mountAuthenticatedMainRoute("/posts/post-harbor-operations-digest");
    waitForDetailRequest("PostById", { id: "post-harbor-operations-digest" }, "Harbor Operations Digest");
};

export const waitForPostComments = (expectedTitle: string, minimumDocs = 1) => {
    cy.wait(
        `@${gqlAlias(MAIN_SERVER_URL, "ListCommentsByTarget", {
            limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
            page: 1,
            relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Posts],
            targetId: "post-harbor-operations-digest",
            url: MAIN_SERVER_URL,
        })}`,
        { timeout: 20000 },
    ).then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });
    cy.contains(".CommentCard", expectedTitle, { timeout: 20000 }).should("be.visible");
};

export const waitForCommentReplies = (parentCommentId: string, expectedTitle: string, minimumDocs = 1) => {
    cy.get(`.CommentCard[data-comment-id="${parentCommentId}"]`)
        .should("be.visible")
        .find(".CommentCard__repliesToggle", { timeout: 20000 })
        .should("be.visible")
        .then(($toggleButton) => {
            if ($toggleButton.text().includes("Show replies")) {
                cy.wrap($toggleButton).click();
            }
        });

    cy.get(".CommentRepliesList .CommentCard", { timeout: 20000 }).should("have.length.at.least", minimumDocs);
    cy.contains(".CommentRepliesList", expectedTitle, { timeout: 20000 }).should("be.visible");
};

export const assertCommentHasNoReplies = (commentId: string) => {
    cy.get(`.CommentCard[data-comment-id="${commentId}"]`)
        .should("be.visible")
        .within(() => {
            cy.get(".CommentCard__repliesToggle").should("not.exist");
        });
    cy.get(`.CommentRepliesList[data-parent-comment-id="${commentId}"]`).should("not.exist");
};

export const openShareAndCommentDetail = (viewport: ViewportConfig) => {
    mountPostDetail();
    cy.get(".EntityCommentsSection").should("be.visible");
    waitForPostComments("Harbor Operations Digest keeps the team aligned.");
    assertCommentHasNoReplies("comment-post-harbor-1");

    const commentId = "comment-post-harbor-1";

    cy.window().then((win) => {
        const copiedUrl = `${win.location.origin}/comments/${commentId}`;
        const clipboardWriteText = cy.stub().resolves();
        Object.defineProperty(win.navigator, "clipboard", {
            configurable: true,
            value: {
                writeText: clipboardWriteText,
            },
        });
        cy.wrap(clipboardWriteText).as("clipboardWriteText");
        cy.wrap(copiedUrl).as("expectedShareUrl");
    });

    cy.contains(".CommentCard", "Harbor Operations Digest keeps the team aligned.")
        .should("be.visible")
        .within(() => {
            cy.contains("button", "Share").click();
        });

    cy.get("@expectedShareUrl").then((expectedShareUrl) => {
        cy.get("@clipboardWriteText").should("have.been.calledOnce");
        cy.get("@clipboardWriteText").should("have.been.calledWith", expectedShareUrl);

        cy.routerNavigate(new URL(String(expectedShareUrl)).pathname);
        waitForDetailRequest("CommentById", { id: commentId }, "Comment");
        cy.contains(".CommentDetailPage", "Harbor Operations Digest keeps the team aligned.").should("be.visible");

        cy.contains(".CommentCard", "Harbor Operations Digest keeps the team aligned.")
            .should("be.visible")
            .within(() => {
                cy.contains("button", "Reply").click();
        });

        selectCommentCompany(".CommentCard .CommentComposer", "Harbor Labs");
        fillCommentText(".CommentCard .CommentComposer", `Detail reply ${viewport.name}`);
        cy.get(".CommentCard .CommentComposer").contains("button", "Reply").click();

        waitForCommentReplies(commentId, `Detail reply ${viewport.name}`);
        cy.contains(".CommentRepliesList", `Detail reply ${viewport.name}`).should("be.visible");
    });
};

export const createAndEditComment = (viewport: ViewportConfig) => {
    mountPostDetail();
    cy.get(".EntityCommentsSection").should("be.visible");
    waitForPostComments("Harbor Operations Digest keeps the team aligned.");
    cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
        if (typeof req.body.query === "string" && req.body.query.includes("CreateComment")) {
            req.alias = "createComment";
        }

        if (typeof req.body.query === "string" && req.body.query.includes("UpdateCommentContent")) {
            req.alias = "updateComment";
        }
    });

    const createdText = `Company comment ${viewport.name}`;
    const editedText = `Edited company comment ${viewport.name}`;
    const editedCompany = "Bazaar Foundry";
    const listCommentsVariables = {
        limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
        page: 1,
        relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Posts],
        targetId: "post-harbor-operations-digest",
        url: MAIN_SERVER_URL,
    };

    fillCommentText(".EntityCommentsSection__header .CommentComposer", createdText);
    assertCommentTextValue(".EntityCommentsSection__header .CommentComposer", createdText);
    selectCommentCompany(".EntityCommentsSection__header .CommentComposer", "Harbor Labs");
    assertCommentCompanyValue(".EntityCommentsSection__header .CommentComposer", "Harbor Labs");
    cy.get(".EntityCommentsSection__header .CommentComposer").contains("button", "Comment").click();

    cy.wait("@createComment", { timeout: 20000 }).then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.request.body.variables.content).to.equal(createdText);
        expect(interception.request.body.variables.company).to.equal("company-harbor-labs");

        const createdCommentId = interception.response?.body?.data?.createComment?.id;
        if (createdCommentId === undefined) {
            throw new Error("Missing created comment id");
        }

        cy.wrap(createdCommentId).as("createdCommentId");
    });
    cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "ListCommentsByTarget", listCommentsVariables)}`, { timeout: 20000 }).then((interception) => {
        const response = interception.response?.body as {
            data?: {
                Comments?: {
                    docs?: Array<{
                        content?: string;
                        id?: string;
                    }>;
                };
            };
        } | undefined;
        const createdComment = response?.data?.Comments?.docs?.[0];

        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(createdComment?.id).to.be.a("string");
        cy.wrap(createdComment?.id as string).as("createdCommentId");
    });

    cy.get("@createdCommentId").then((createdCommentId) => {
        cy.get(`.CommentCard[data-comment-id="${createdCommentId}"]`).within(() => {
            cy.contains("button", "Edit").click();
        });
    });
    fillCommentText(".CommentCard .CommentComposer", editedText);
    assertCommentTextValue(".CommentCard .CommentComposer", editedText);
    selectCommentCompany(".CommentCard .CommentComposer", editedCompany);
    assertCommentCompanyValue(".CommentCard .CommentComposer", editedCompany);
    cy.get(".CommentCard .CommentComposer").contains("button", "Save").click();

    cy.get("@createdCommentId").then((createdCommentId) => {
        cy.wait("@updateComment", { timeout: 20000 }).then((interception) => {
            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.id).to.equal(createdCommentId);
            expect(interception.request.body.variables.company).to.equal("company-bazaar-foundry");
            expect(interception.request.body.variables.content).to.equal(editedText);
        });
        cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "ListCommentsByTarget", listCommentsVariables)}`, { timeout: 20000 }).then((interception) => {
            const response = interception.response?.body as {
                data?: {
                    Comments?: {
                        docs?: Array<{
                            content?: string;
                            id?: string;
                        }>;
                    };
                };
            } | undefined;
            const updatedComment = response?.data?.Comments?.docs?.[0];

            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(updatedComment?.id).to.equal(createdCommentId);
        });
        cy.get(`.CommentCard[data-comment-id="${createdCommentId}"]`).should("be.visible");
    });
};

export const replyToReplyChain = (viewport: ViewportConfig) => {
    mountAuthenticatedMainRoute("/comments/comment-startup-sky-1");
    waitForDetailRequest("CommentById", { id: "comment-startup-sky-1" }, "Comment");
    cy.contains(".CommentDetailPage", "Sky Relay could use more testers.").should("be.visible");
    cy.contains('.CommentCard[data-comment-id="comment-startup-sky-1"]', "Sky Relay could use more testers.")
        .should("be.visible")
        .within(() => {
            cy.contains("button", "Show replies (1)").should("be.visible");
        });
    waitForCommentReplies("comment-startup-sky-1", "Replying to the Sky Relay thread.", 1);
    cy.contains(".CommentRepliesList", "Replying to the Sky Relay thread.").should("be.visible");

    cy.contains('.CommentCard[data-comment-id="comment-reply-1"]', "Replying to the Sky Relay thread.")
        .should("be.visible")
        .within(() => {
            cy.get(".CommentCard__repliesToggle").should("not.exist");
        });
    openCommentCardAction("Replying to the Sky Relay thread.", "Reply");
    fillCommentText(".CommentCard .CommentComposer", `Nested reply ${viewport.name}`);
    cy.get(".CommentCard .CommentComposer").contains("button", "Reply").click();

    cy.get(".CommentRepliesList .CommentCard", { timeout: 20000 }).should("have.length.at.least", 1);
    cy.contains(".CommentRepliesList", `Nested reply ${viewport.name}`).should("be.visible");
};
