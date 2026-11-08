import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "react-oidc-context";
import { MemoryRouter } from "react-router-dom";
import { AntProvider } from "../../../../src/components/AntProvider";
import { EndpointContext } from "../../../../src/components/EndpointContext";
import { createLikeSecurityFixture } from "../like/utils";
import { Comment_ReplyPost_RelationTo } from "../../../../src/generated/graphql";
import type { CommentCardProps } from "../../../../src/components/comments/types";

export const mountCommentInteraction = (
    component: React.ReactNode,
    fixture: ReturnType<typeof createLikeSecurityFixture>,
) =>
    mount(
        <AntProvider>
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <AuthProvider userManager={fixture.manager} skipSigninCallback>
                    <EndpointContext.Provider value={fixture.endpoint}>
                        <MemoryRouter>{component}</MemoryRouter>
                    </EndpointContext.Provider>
                </AuthProvider>
            </QueryClientProvider>
        </AntProvider>,
    );

export const createCommentInteractionFixture = (serverUrl: string) =>
    ({
        comment: {
            id: "comment",
            content: "Fixture comment",
            serverUrl,
            company: { id: "company", name: "Fixture company", serverURL: serverUrl },
            createdBy: { id: "alice", name: "Alice", email: "alice@example.test" },
            replyPost: { relationTo: Comment_ReplyPost_RelationTo.Companies },
        },
        currentUser: {
            currentUserId: "alice",
            currentUserImg: "",
            currentUserProfile: "",
            currentUserFullName: "Alice",
        },
        commentEditPlaceholder: "Edit comment",
        commentReplyPlaceholder: "Reply to comment",
        likeMutation: { mutate: cy.stub() },
        dislikeMutation: { mutate: cy.stub() },
        onDeleteAction: cy.stub().resolves(),
        onEditAction: cy.stub().resolves(),
        onReplyAction: cy.stub().resolves(),
        onShare: cy.stub(),
    }) satisfies CommentCardProps;
