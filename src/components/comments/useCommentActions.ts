import {
    type Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { useCreateReplyToCommentMutation, useDeleteCommentMutation, useUpdateCommentContentMutation } from "../hooks";

import type { CommentDeletePayload, CommentEditPayload, CommentReplyPayload } from "./types";

type CommentReplyTarget = {
    relationTo: Comment_ReplyPostRelationshipInputRelationTo | null | undefined;
    value: string | null | undefined;
};

type UseCommentActionsArgs = {
    isAuthenticated: boolean;
    refresh: () => Promise<void>;
    url?: string | null;
    replyToPost: CommentReplyTarget;
};

type CommentActions = {
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
    onDeleteAction: (payload: CommentDeletePayload) => Promise<void>;
};

export const useCommentActions = (args: UseCommentActionsArgs): CommentActions => {
    const createReply = useCreateReplyToCommentMutation();
    const deleteComment = useDeleteCommentMutation();
    const updateComment = useUpdateCommentContentMutation();

    const onReplyAction = async (payload: CommentReplyPayload) => {
        const content = payload.text.trim();
        const repliedToCommentId = payload.repliedToCommentId;
        if (!content || !repliedToCommentId || !args.replyToPost.relationTo || !args.replyToPost.value) {
            return;
        }

        const replyVariables = args.url
            ? {
                  url: args.url,
                  replyToPost: {
                      relationTo: args.replyToPost.relationTo,
                      value: args.replyToPost.value,
                  },
                  parentCommentId: repliedToCommentId,
                  content,
              }
            : {
                  replyToPost: {
                      relationTo: args.replyToPost.relationTo,
                      value: args.replyToPost.value,
                  },
                  parentCommentId: repliedToCommentId,
                  content,
              };

        await createReply.mutateAsync(replyVariables satisfies Parameters<typeof createReply.mutateAsync>[0]);
        await args.refresh();
    };

    const onEditAction = async (payload: CommentEditPayload) => {
        const content = payload.text.trim();
        if (!args.isAuthenticated || !content || !payload.comId) {
            return;
        }

        const updateVariables = args.url
            ? {
                  url: args.url,
                  id: payload.comId,
                  content,
              }
            : {
                  id: payload.comId,
                  content,
              };

        await updateComment.mutateAsync(updateVariables satisfies Parameters<typeof updateComment.mutateAsync>[0]);
        await args.refresh();
    };

    const onDeleteAction = async (payload: CommentDeletePayload) => {
        if (!args.isAuthenticated || !payload.comIdToDelete) {
            return;
        }

        const deleteVariables = args.url
            ? {
                  url: args.url,
                  id: payload.comIdToDelete,
              }
            : {
                  id: payload.comIdToDelete,
              };

        await deleteComment.mutateAsync(deleteVariables satisfies Parameters<typeof deleteComment.mutateAsync>[0]);
        await args.refresh();
    };

    return {
        onReplyAction,
        onEditAction,
        onDeleteAction,
    };
};
