import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EndpointContext } from "../../src/components/EndpointContext";
import { CommentRepliesList } from "../../src/components/comments/CommentRepliesList";
import { CommentComposerActions } from "../../src/components/comments/CommentComposerActions";
import { CommentCard } from "../../src/components/comments/CommentCard";
import type { ListCommentRepliesQuery, ListCommentRepliesQueryVariables } from "../../src/generated/graphql";
import { createLikeSecurityFixture } from "../support/security-regressions/like/utils";
import {
    createCommentInteractionFixture,
    mountCommentInteraction,
} from "../support/security-regressions/comments/utils";

describe("Comment interaction recovery", { retries: 0 }, () => {
    it("keeps failed comment text with persistent feedback and permits a successful retry", () => {
        const fixture = createLikeSecurityFixture();
        const save = cy.stub().onFirstCall().rejects(new Error("Fixture save failed"));
        save.onSecondCall().resolves();
        cy.intercept("POST", `${fixture.endpoint.authUrl}/api/graphql`, {
            data: { meUser: { user: { id: "alice" } } },
        });
        mountCommentInteraction(
            <CommentComposerActions
                serverURL={fixture.endpoint.authUrl}
                placeholder="Comment draft"
                submitLabel="Save comment"
                onSubmit={save}
            />,
            fixture,
        );
        cy.get('textarea[placeholder="Comment draft"]').type("My comment survives a backend failure");
        cy.contains("button", "Save comment").click();
        cy.wrap(save).should("have.been.calledOnce");
        cy.get(".CommentComposer .ant-alert-error").should("contain.text", "Your text has been kept");
        cy.get('textarea[placeholder="Comment draft"]').should("have.value", "My comment survives a backend failure");
        cy.contains("button", "Save comment").should("not.be.disabled").click();
        cy.get('textarea[placeholder="Comment draft"]').should("have.value", "");
        cy.get(".CommentComposer .ant-alert-error").should("not.exist");
        cy.then(() => {
            expect(save.callCount).to.equal(2);
            expect(save.secondCall.args[0].text).to.equal(save.firstCall.args[0].text);
        });
    });

    it("keeps a comment after rejected deletion and lets its owner retry explicitly", () => {
        const fixture = createLikeSecurityFixture();
        const props = createCommentInteractionFixture(fixture.endpoint.authUrl);
        props.onDeleteAction.onFirstCall().rejects(new Error("Fixture delete failed"));
        mountCommentInteraction(<CommentCard {...props} />, fixture);
        cy.get('button[aria-label="Delete"]').click();
        cy.get(".ant-popconfirm").contains("button", "Delete").click();
        cy.contains("Could not delete the comment").should("be.visible");
        cy.contains(".CommentCard__content", "Fixture comment").should("be.visible");
        cy.get('button[aria-label="Delete"]').click();
        cy.get(".ant-popconfirm").contains("button", "Delete").click();
        cy.then(() => expect(props.onDeleteAction.callCount).to.equal(2));
    });
    it("loads the next source-bound page, retains earlier replies, and stops at the final page", () => {
        const fixture = createLikeSecurityFixture();
        const props = createCommentInteractionFixture(fixture.endpoint.authUrl);
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        cy.intercept<{ query: string; variables: ListCommentRepliesQueryVariables }>(
            "POST",
            `${fixture.endpoint.authUrl}/api/graphql`,
            (request) => {
                if (!request.body.query.includes("ListCommentReplies")) {
                    request.reply({ body: { data: { meUser: { user: props.comment.createdBy } } } });
                    return;
                }
                const page = request.body.variables.page;
                request.alias = page === 1 ? "firstReplies" : "nextReplies";
                const data: ListCommentRepliesQuery = {
                    Comments: {
                        totalDocs: 2,
                        hasNextPage: page === 1,
                        nextPage: page === 1 ? 2 : null,
                        docs: [{ ...props.comment, id: `reply-${page}`, content: `Reply on page ${page}` }],
                    },
                };
                request.reply({ body: { data } });
            },
        );
        mount(
            <QueryClientProvider client={client}>
                <AuthProvider userManager={fixture.manager} skipSigninCallback>
                    <EndpointContext.Provider value={fixture.endpoint}>
                        <MemoryRouter>
                            <CommentRepliesList
                                {...props}
                                parentCommentId="parent"
                                serverURL={fixture.endpoint.authUrl}
                            />
                        </MemoryRouter>
                    </EndpointContext.Provider>
                </AuthProvider>
            </QueryClientProvider>,
        );
        cy.wait("@firstReplies");
        cy.contains(".CommentCard__content", "Reply on page 1").should("be.visible");
        cy.contains("button", "Load more replies").click();
        cy.wait("@nextReplies");
        cy.contains(".CommentCard__content", "Reply on page 1").should("be.visible");
        cy.contains(".CommentCard__content", "Reply on page 2").should("be.visible");
        cy.contains("button", "Load more replies").should("not.exist");
    });
});
