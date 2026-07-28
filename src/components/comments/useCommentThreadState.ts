import * as React from "react";

import type { AuthProfile } from "../../types";
import { useDislikeCommentMutation, useLikeCommentMutation } from "../hooks";
import type { DislikeMutation, DislikeMutationVariables, LikeMutation, LikeMutationVariables } from "../shared/Like/types";
import type { CommentCurrentUser } from "./types";
import { getCommentCurrentUser } from "./utils";

type CommentThreadStateArgs = {
    isAuthenticated: boolean;
    profile?: AuthProfile;
};

type CommentThreadState = {
    currentUser: CommentCurrentUser;
    likeMutation: LikeMutation;
    dislikeMutation: DislikeMutation;
};

export const useCommentThreadState = (args: CommentThreadStateArgs): CommentThreadState => {
    const currentUser = React.useMemo(
        () => getCommentCurrentUser(args.isAuthenticated, args.profile),
        [args.isAuthenticated, args.profile],
    );
    const commentLikeMutation = useLikeCommentMutation();
    const commentDislikeMutation = useDislikeCommentMutation();

    const likeMutation: LikeMutation = {
        isPending: commentLikeMutation.isPending,
        mutate: ({ id, liked }: LikeMutationVariables) => commentLikeMutation.mutate({ id, liked }),
    };
    const dislikeMutation: DislikeMutation = {
        isPending: commentDislikeMutation.isPending,
        mutate: ({ id }: DislikeMutationVariables) => commentDislikeMutation.mutate({ id }),
    };

    return {
        currentUser,
        likeMutation,
        dislikeMutation,
    };
};
