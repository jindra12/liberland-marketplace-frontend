import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useQueryClient } from "@tanstack/react-query";

import { theme } from "antd";

import {
    COMMENT_RELATION_TO_QUERY_RELATION,
    ENTITY_COMMENTS_DEFAULT_LIMIT,
    ENTITY_COMMENTS_DEFAULT_PLACEHOLDER,
} from "../../constants";
import { useListCommentsByTargetQuery as useListCommentsByTargetQuerySingle } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import {
    AuthProfile,
    CommentDeletePayload,
    CommentEditPayload,
    CommentReplyPayload,
    CommentSubmitPayload,
    EntityCommentsSectionProps,
} from "../../types";
import {
    useCreateCommentMutation,
    useCreateReplyToCommentMutation,
    useDeleteCommentMutation,
    useListCommentsByTargetQuery,
    useUpdateCommentContentMutation,
} from "../hooks";

import { EntityCommentsSectionDisplay } from "./EntityCommentsSectionDisplay";
import { buildCommentData, getCommentCurrentUser, getCommentSectionStyles, getCommentThemeVars } from "./utils";

export const EntityCommentsSection: React.FunctionComponent<EntityCommentsSectionProps> = (props) => {
    const auth = useAuth();
    const { token } = theme.useToken();
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
    }
    const createComment = useCreateCommentMutation();
    const createReply = useCreateReplyToCommentMutation();
    const updateComment = useUpdateCommentContentMutation();
    const deleteComment = useDeleteCommentMutation();
    const profile = auth.user?.profile as AuthProfile | undefined;
    const currentUser = React.useMemo(
        () => getCommentCurrentUser(auth.isAuthenticated, profile),
        [auth.isAuthenticated, profile],
    );
    const accumulatedDocs = useAccumulatedDocs(comments.data?.Comments?.docs || [], page);
    const commentData = React.useMemo(() => {
        return buildCommentData(accumulatedDocs);
    }, [accumulatedDocs]);
    const commentThemeVars = React.useMemo(() => getCommentThemeVars(token), [token]);
    const commentSectionStyles = React.useMemo(() => getCommentSectionStyles(token), [token]);
    const onSubmitAction = async (payload: CommentSubmitPayload) => {
        console.log(payload);
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
            content,
        });
        await refresh();
    };
    const onReplyAction = async (payload: CommentReplyPayload) => {
        const content = payload.text.trim();
        const parentCommentId = payload.repliedToCommentId;
        if (!content || !parentCommentId) {
            return;
        }
        await createReply.mutateAsync({
            url: props.serverURL,
            replyToPost: {
                relationTo: props.relationTo,
                value: props.targetId,
            },
            parentCommentId,
            content,
        });
        await refresh();
    };
    const onEditAction = async (payload: CommentEditPayload) => {
        if (!auth.isAuthenticated) {
            return;
        }
        const content = payload.text.trim();
        const commentId = payload.comId;
        if (!content || !commentId) {
            return;
        }
        await updateComment.mutateAsync({
            url: props.serverURL,
            id: commentId,
            content,
        });
        await refresh();
    };
    const onDeleteAction = async (payload: CommentDeletePayload) => {
        const commentId = payload.comIdToDelete;
        if (!auth.isAuthenticated || !commentId) {
            return;
        }
        await deleteComment.mutateAsync({
            url: props.serverURL,
            id: commentId,
        });
        await refresh();
    };
    
    return (
        <EntityCommentsSectionDisplay
            className={props.className}
            commentData={commentData}
            commentSectionStyles={commentSectionStyles}
            commentThemeVars={commentThemeVars}
            commentsCount={comments.data?.Comments?.totalDocs}
            currentUser={currentUser}
            hasMore={comments.data?.Comments?.hasNextPage || false}
            isAnonymous={!auth.isAuthenticated}
            isError={comments.isError}
            isLoading={comments.isLoading}
            onDeleteAction={onDeleteAction}
            onEditAction={onEditAction}
            onLoadMore={() => {
                setPage((currentPage) => currentPage + 1);
            }}
            onLogin={() => auth.signinRedirect()}
            onReplyAction={onReplyAction}
            onSignUp={() => auth.signinRedirect()}
            onSubmitAction={onSubmitAction}
            placeholder={ENTITY_COMMENTS_DEFAULT_PLACEHOLDER}
        />
    );
};
