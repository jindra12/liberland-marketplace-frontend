import { useAuth } from "react-oidc-context";

import { useQueryClient } from "@tanstack/react-query";

import type { Comment_ReplyPostRelationshipInputRelationTo } from "../../generated/graphql";
import type { CommentByIdQuery } from "../../generated/graphql";
import type { AuthProfile } from "../../types";
import type { DislikeMutation, LikeMutation } from "../shared/Like/types";
import { useCommentByIdQuery } from "../hooks";

import type { CommentCurrentUser } from "./types";
import { useCommentThreadState } from "./useCommentThreadState";
import { useCommentActions } from "./useCommentActions";
import { copyCommentLink } from "./utils";

type UseCommentDetailStateArgs = {
    commentId: string;
};

type CommentDetailState = {
    comment?: CommentByIdQuery["Comment"];
    currentUser: CommentCurrentUser;
    dislikeMutation: DislikeMutation;
    isAnonymous: boolean;
    isLoading: boolean;
    likeMutation: LikeMutation;
    onDeleteAction: ReturnType<typeof useCommentActions>["onDeleteAction"];
    onEditAction: ReturnType<typeof useCommentActions>["onEditAction"];
    onReplyAction: ReturnType<typeof useCommentActions>["onReplyAction"];
    handleShare: (targetCommentId: string) => Promise<void>;
};

export const useCommentDetailState = (args: UseCommentDetailStateArgs): CommentDetailState => {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const commentQuery = useCommentByIdQuery({ id: args.commentId });
    const { currentUser, dislikeMutation, likeMutation } = useCommentThreadState({
        isAuthenticated: auth.isAuthenticated,
        profile: auth.user?.profile as AuthProfile | undefined,
    });
    const refresh = async () => {
        await queryClient.resetQueries({
            predicate: (query) => {
                const key = query.queryKey[0];
                return key === "ListCommentReplies" || key === "CommentById";
            },
        });
    };
    const comment = commentQuery.data?.Comment;
    const commentActions = useCommentActions({
        isAuthenticated: auth.isAuthenticated,
        refresh,
        replyToPost: {
            relationTo: comment?.replyPostRelationTo as Comment_ReplyPostRelationshipInputRelationTo | undefined,
            value: comment?.replyPostValue,
        },
        url: comment?.serverUrl,
    });

    const handleShare = async (targetCommentId: string) => {
        try {
            await copyCommentLink(targetCommentId);
        } catch (error) {
            console.error("Failed to copy comment link", error);
        }
    };

    return {
        comment,
        currentUser,
        dislikeMutation,
        isAnonymous: !auth.isAuthenticated,
        isLoading: commentQuery.isLoading,
        likeMutation,
        onDeleteAction: commentActions.onDeleteAction,
        onEditAction: commentActions.onEditAction,
        onReplyAction: commentActions.onReplyAction,
        handleShare,
    };
};
