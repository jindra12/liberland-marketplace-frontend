import { Comment_ReplyPostRelationshipInputRelationTo } from "../../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION, ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../../src/constants";

import { detailRoute, MAIN_SERVER_URL } from "../../support/component-tests/constants";
import {
    gqlAlias,
    mountAuthenticatedMainRoute,
} from "../../support/component-tests/utils";
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

export const runOnViewport = (viewport: ViewportConfig, run: (viewport: ViewportConfig) => void) => {
    cy.viewport(viewport.width, viewport.height);
    run(viewport);
};

export const runOnBothViewports = (run: (viewport: ViewportConfig) => void) => {
    runOnViewport(DESKTOP_VIEWPORT, () => {
        run(DESKTOP_VIEWPORT);
    });

    runOnViewport(MOBILE_VIEWPORT, () => {
        run(MOBILE_VIEWPORT);
    });
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
    cy.get(containerSelector)
        .find(".ant-select")
        .first()
        .should("be.visible")
        .and("not.have.class", "ant-select-disabled")
        .find(".ant-select-selector")
        .click({ force: true });
    cy.get(".ant-select-dropdown").should("be.visible");
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", companyName).click({
        force: true,
    });
};

export const assertCommentCompanyValue = (containerSelector: string, companyName: string) => {
    cy.contains(containerSelector, "Author company")
        .find(".ant-select")
        .should("contain.text", companyName);
};

export const assertCommentTextValue = (containerSelector: string, text: string) => {
    cy.get(containerSelector).find("textarea").first().should("have.value", text);
};

export const fillCommentText = (containerSelector: string, text: string) => {
    cy.get(containerSelector).find("textarea").first().clear({ force: true }).type(text, { force: true });
};

export const openCommentCardAction = (commentText: string, actionLabel: string) => {
    cy.contains(".CommentCard:visible", commentText).scrollIntoView().should("be.visible").within(() => {
        cy.get(`button[aria-label="${actionLabel}"]`).first().click({ force: true });
    });
};

export const waitForCollectionRequest = (
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedTitle: string,
    minimumDocs = 1,
) => {
    cy.wait(`@${gqlAlias(MAIN_SERVER_URL, operationName, expectedVariables)}`).then((interception) => {
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

export const waitForDetailRequest = (selector: string, expectedText: string) => {
    cy.contains(selector, expectedText).should("be.visible");
};

const mountPostDetail = () => {
    cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
        const body = req.body as { operationName?: string; query?: string };
        if (body.operationName === "PostById" || body.query?.includes("PostById")) {
            req.alias = "postById";
        }
    });

    mountAuthenticatedMainRoute(detailRoute("/posts", "post-harbor-operations-digest"), true);

    cy.wait("@postById").then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });

    cy.get(".PostDetail").should("be.visible");
    cy.contains(".PostDetail", "Harbor Operations Digest").should("be.visible");
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
    ).then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });
    cy.contains(".CommentCard", expectedTitle).should("be.visible");
};

export const waitForCommentReplies = (parentCommentId: string, expectedTitle: string, minimumDocs = 1) => {
    cy.get(`.CommentCard[data-comment-id="${parentCommentId}"]`).should("be.visible");
    cy.get(`.CommentCard[data-comment-id="${parentCommentId}"]`)
        .find(".CommentCard__repliesToggle")
        .should("exist")
        .then(($toggleButton) => {
            const toggleLabel = $toggleButton.attr("aria-label");
            if (toggleLabel?.startsWith("Show replies")) {
                cy.wrap($toggleButton).click();
            }
        });

    cy.get(".CommentRepliesList .CommentCard").should("have.length.at.least", minimumDocs);
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
    const commentId = "comment-post-harbor-1";

    cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
        if (typeof req.body.query === "string" && req.body.query.includes("CommentById")) {
            req.alias = "commentById";
        }
    });

    mountAuthenticatedMainRoute(detailRoute("/comments", commentId), true);

    cy.wait("@commentById").then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });

    cy.get('.CommentDetailPage .CommentCard[data-comment-id="comment-post-harbor-1"]').should("be.visible");
    cy.contains(".CommentDetailPage .CommentCard__content", "Harbor Operations Digest keeps the team aligned.")
        .should("be.visible");

    cy.window().then((win) => {
        const copiedUrl = `${win.location.origin}${detailRoute("/comments", commentId)}`;
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

    cy.get('.CommentDetailPage .CommentCard[data-comment-id="comment-post-harbor-1"]')
        .scrollIntoView()
        .should("be.visible")
        .within(() => {
            cy.contains("button", "Share").click({ force: true });
        });

    cy.get("@expectedShareUrl").then((expectedShareUrl) => {
        cy.get("@clipboardWriteText").should("have.been.calledOnce");
        cy.get("@clipboardWriteText").should("have.been.calledWith", expectedShareUrl);

        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (typeof req.body.query === "string" && req.body.query.includes("CreateReplyToComment")) {
                req.alias = "createReply";
            }
        });

        cy.get('.CommentDetailPage .CommentCard[data-comment-id="comment-post-harbor-1"]')
            .should("be.visible")
            .scrollIntoView()
            .within(() => {
                cy.get('button[aria-label="Reply"]').first().click({ force: true });
            });

        cy.get(".CommentCard .CommentComposer").should("be.visible");
        selectCommentCompany(".CommentCard .CommentComposer", "Harbor Labs");
        fillCommentText(".CommentCard .CommentComposer", `Detail reply ${viewport.name}`);
        cy.get(".CommentCard .CommentComposer").contains("button", "Reply").click();

        cy.wait("@createReply").then((interception) => {
            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.content).to.equal(`Detail reply ${viewport.name}`);
            expect(interception.request.body.variables.company).to.equal("company-harbor-labs");
            expect(interception.request.body.variables.parentCommentId).to.equal(commentId);
        });
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

    cy.wait("@createComment").then((interception) => {
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
    cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "ListCommentsByTarget", listCommentsVariables)}`).then((interception) => {
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
        cy.wait("@updateComment").then((interception) => {
            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables.id).to.equal(createdCommentId);
            expect(interception.request.body.variables.company).to.equal("company-bazaar-foundry");
            expect(interception.request.body.variables.content).to.equal(editedText);
        });
        cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "ListCommentsByTarget", listCommentsVariables)}`).then((interception) => {
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
    cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
        if (typeof req.body.query === "string" && req.body.query.includes("CommentById")) {
            req.alias = "commentById";
        }
        if (typeof req.body.query === "string" && req.body.query.includes("ListCommentReplies")) {
            req.alias = "commentReplies";
        }
    });

    mountAuthenticatedMainRoute(detailRoute("/comments", "comment-startup-sky-1"), true);

    cy.wait("@commentById").then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });

    cy.get('.CommentDetailPage .CommentCard[data-comment-id="comment-startup-sky-1"]').should("be.visible");
    cy.contains(".CommentDetailPage .CommentCard__content", "Sky Relay could use more testers.").should("be.visible");
    cy.contains('.CommentCard[data-comment-id="comment-startup-sky-1"]', "Sky Relay could use more testers.")
        .should("be.visible")
        .within(() => {
            cy.contains("button", "Show replies (1)").should("be.visible").click({ force: true });
    });
    cy.wait("@commentReplies").then((interception) => {
        expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
    });
    waitForCommentReplies("comment-startup-sky-1", "Replying to the Sky Relay thread.", 1);

    cy.get(".CommentRepliesList .CommentCard")
        .first()
        .should("be.visible")
        .scrollIntoView()
        .within(() => {
            cy.get('button[aria-label="Reply"]').first().click({ force: true });
        });
    cy.get(".CommentCard .CommentComposer").should("be.visible");
    fillCommentText(".CommentCard .CommentComposer", `Nested reply ${viewport.name}`);
    cy.get(".CommentCard .CommentComposer").contains("button", "Reply").click();

    cy.get(".CommentRepliesList .CommentCard").should("have.length.at.least", 1);
    cy.contains(".CommentRepliesList", `Nested reply ${viewport.name}`).should("be.visible");
};
