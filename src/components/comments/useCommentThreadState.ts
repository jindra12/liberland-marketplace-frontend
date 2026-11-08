import * as React from "react";

import type { AuthProfile } from "../../types";
import { useDislikeCommentMutation, useLikeCommentMutation } from "../hooks";
import type { DislikeMutation, LikeMutation } from "../shared/Like/types";
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

    return {
        currentUser,
        likeMutation: commentLikeMutation,
        dislikeMutation: commentDislikeMutation,
    };
};
