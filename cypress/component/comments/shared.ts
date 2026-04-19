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
};

export const assertCommentCompanyValue = (containerSelector: string, companyName: string) => {
    cy.contains(containerSelector, "Author company").find("input").should("have.value", companyName);
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
    cy.contains(".CommentRepliesList", expectedTitle, { timeout: 20000 }).should("be.visible");
};

export const openShareAndCommentDetail = (viewport: ViewportConfig) => {
    mountPostDetail();
    cy.get(".EntityCommentsSection").should("be.visible");
    waitForPostComments("Harbor Operations Digest keeps the team aligned.");

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
        assertCommentCompanyValue(".CommentCard .CommentComposer", "Harbor Labs");
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
    waitForCollectionRequest(
        "ListCompaniesByCreator",
        {
            draft: true,
            limit: 100,
            page: 1,
            userId: "user-nova",
            url: MAIN_SERVER_URL,
        },
        "Companies",
        "Harbor Labs",
        2,
    );

    const createdText = `Company comment ${viewport.name}`;
    const editedText = `Edited company comment ${viewport.name}`;

    fillCommentText(".EntityCommentsSection__header .CommentComposer", createdText);
    selectCommentCompany(".EntityCommentsSection__header .CommentComposer", "Harbor Labs");
    cy.get(".EntityCommentsSection__header .CommentComposer").contains("button", "Comment").click();

    waitForPostComments(createdText, 2);
    cy.contains(".CommentCard", createdText).should("be.visible");

    openCommentCardAction(createdText, "Edit");
    waitForCollectionRequest(
        "ListCompaniesByCreator",
        {
            draft: true,
            limit: 100,
            page: 1,
            userId: "user-nova",
            url: MAIN_SERVER_URL,
        },
        "Companies",
        "Harbor Labs",
        2,
    );
    assertCommentCompanyValue(".CommentCard .CommentComposer", "Harbor Labs");
    fillCommentText(".CommentCard .CommentComposer", editedText);
    selectCommentCompany(".CommentCard .CommentComposer", "Harbor Works");
    cy.get(".CommentCard .CommentComposer").contains("button", "Save").click();

    waitForPostComments(editedText, 2);
    cy.contains(".CommentCard", editedText).should("be.visible");
    cy.contains(".CommentCard", editedText).within(() => {
        cy.contains(".CommentCard__author", "Harbor Works").should("be.visible");
    });
};

export const replyToReplyChain = (viewport: ViewportConfig) => {
    mountAuthenticatedMainRoute("/comments/comment-startup-sky-1");
    waitForDetailRequest("CommentById", { id: "comment-startup-sky-1" }, "Comment");
    cy.contains(".CommentDetailPage", "Sky Relay could use more testers.").should("be.visible");
    waitForCommentReplies("comment-startup-sky-1", "Replying to the Sky Relay thread.", 1);
    cy.contains(".CommentRepliesList", "Replying to the Sky Relay thread.").should("be.visible");

    openCommentCardAction("Replying to the Sky Relay thread.", "Reply");
    waitForCollectionRequest(
        "ListCompaniesByCreator",
        {
            draft: true,
            limit: 100,
            page: 1,
            userId: "user-nova",
            url: MAIN_SERVER_URL,
        },
        "Companies",
        "Harbor Labs",
        2,
    );
    assertCommentCompanyValue(".CommentCard .CommentComposer", "Harbor Labs");
    fillCommentText(".CommentCard .CommentComposer", `Nested reply ${viewport.name}`);
    cy.get(".CommentCard .CommentComposer").contains("button", "Reply").click();

    waitForCollectionRequest(
        "ListCommentReplies",
        {
            limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
            page: 1,
            parentCommentId: "comment-reply-1",
            url: MAIN_SERVER_URL,
        },
        "Comments",
        `Nested reply ${viewport.name}`,
        1,
    );
    cy.contains(".CommentRepliesList", `Nested reply ${viewport.name}`).should("be.visible");
};
