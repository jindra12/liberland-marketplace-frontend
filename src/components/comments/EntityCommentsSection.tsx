import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useQueryClient } from "@tanstack/react-query";

import {
    COMMENT_RELATION_TO_QUERY_RELATION,
    ENTITY_COMMENTS_DEFAULT_LIMIT,
} from "../../constants";
import { useListCommentsByTargetQuery as useListCommentsByTargetQuerySingle } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { AuthProfile } from "../../types";
import { useCreateCommentMutation, useListCommentsByTargetQuery } from "../hooks";

import { EntityCommentsSectionDisplay } from "./EntityCommentsSectionDisplay";
import type { CommentSubmitPayload, EntityCommentsSectionProps } from "./types";
import { useCommentActions } from "./useCommentActions";
import { useCommentThreadState } from "./useCommentThreadState";

export const EntityCommentsSection: React.FunctionComponent<EntityCommentsSectionProps> = (props) => {
    const auth = useAuth();
    const [page, setPage] = React.useState(1);
    const queryClient = useQueryClient();
    const queryRelationTo = COMMENT_RELATION_TO_QUERY_RELATION[props.relationTo];
    const comments = useListCommentsByTargetQuery({
        targetId: props.targetId,
        relationTo: queryRelationTo,
        limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
        url: props.serverURL,
        page,
    });
    const { currentUser, dislikeMutation, likeMutation } = useCommentThreadState({
        isAuthenticated: auth.isAuthenticated,
        profile: auth.user?.profile as AuthProfile | undefined,
    });
    const refresh = async () => {
        await comments.refetch();
        await queryClient.invalidateQueries({
            predicate: (query) => {
                const [type] = useListCommentsByTargetQuerySingle.getKey({
                    targetId: props.targetId,
                    relationTo: queryRelationTo,
                });
                const [predType, predVars] = query.queryKey;
                return Boolean(
                    type === predType && predVars && typeof predVars === "object" && "targetId" in predVars && predVars.targetId === props.targetId
                );
            },
        });
        await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === "ListCommentReplies",
        });
    }
    const createComment = useCreateCommentMutation();
    const accumulatedDocs = useAccumulatedDocs(comments.data?.Comments?.docs || [], page);
    const commentActions = useCommentActions({
        isAuthenticated: auth.isAuthenticated,
        refresh,
        url: props.serverURL,
        replyToPost: {
            relationTo: props.relationTo,
            value: props.targetId,
        },
    });
    const onSubmitAction = async (payload: CommentSubmitPayload) => {
        const content = payload.text.trim();
        if (!content) {
            return;
        }
        await createComment.mutateAsync({
            url: props.serverURL,
            replyToPost: {
                relationTo: props.relationTo,
                value: props.targetId,
            },
            company: payload.company,
            content,
        });
        await refresh();
    };

    return (
        <EntityCommentsSectionDisplay
            className={props.className}
            commentsCount={comments.data?.Comments?.totalDocs}
            currentUser={currentUser}
            hasMore={comments.data?.Comments?.hasNextPage || false}
            isAnonymous={!auth.isAuthenticated}
            isError={comments.isError}
            isLoading={comments.isLoading}
            dislikeMutation={dislikeMutation}
            likeMutation={likeMutation}
            rootComments={accumulatedDocs}
            serverURL={props.serverURL}
            onDeleteAction={commentActions.onDeleteAction}
            onEditAction={commentActions.onEditAction}
            onLoadMore={() => {
                setPage((currentPage) => currentPage + 1);
            }}
            onLogin={() => auth.signinRedirect()}
            onReplyAction={commentActions.onReplyAction}
            onSignUp={() => auth.signinRedirect()}
            onSubmitAction={onSubmitAction}
        />
    );
};
