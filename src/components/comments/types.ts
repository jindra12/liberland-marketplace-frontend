import type { CSSProperties } from "react";

import type { Comment_ReplyPostRelationshipInputRelationTo, CommentByIdQuery, ListCommentRepliesQuery, ListCommentsByTargetQuery } from "../../generated/graphql";
import type { DislikeMutation, LikeMutation } from "../shared/Like/types";

export type EntityCommentsSectionProps = {
    targetId: string;
    relationTo: Comment_ReplyPostRelationshipInputRelationTo;
    className?: string;
    serverURL?: string | null;
};

export type CommentCurrentUser = {
    currentUserId: string;
    currentUserImg: string;
    currentUserProfile: string;
    currentUserFullName: string;
};

export type CommentSectionStyles = {
    overlayStyle: CSSProperties;
    formStyle: CSSProperties;
    inputStyle: CSSProperties;
    replyInputStyle: CSSProperties;
    submitBtnStyle: CSSProperties;
    cancelBtnStyle: CSSProperties;
    hrStyle: CSSProperties;
    titleStyle: CSSProperties;
};

export type CommentSubmitPayload = { text: string; company: string };
export type CommentReplyPayload = { text: string; repliedToCommentId: string; company: string };
export type CommentEditPayload = { text: string; comId: string };
export type CommentDeletePayload = { comIdToDelete: string };

export type EntityCommentsThemeToken = {
    colorBgContainer: string;
    colorFillAlter: string;
    colorBgElevated: string;
    colorText: string;
    colorTextSecondary: string;
    colorTextPlaceholder: string;
    colorBorder: string;
    colorBorderSecondary: string;
    colorPrimary: string;
    colorPrimaryHover: string;
    colorFillSecondary: string;
    colorTextLightSolid: string;
    colorTextHeading: string;
    fontFamily: string;
    borderRadiusLG: number;
    borderRadius: number;
    padding: number;
    fontSizeHeading4: number;
    fontSizeHeading5: number;
    lineHeightHeading5: number;
};

export type CommentThread =
    | NonNullable<NonNullable<ListCommentsByTargetQuery["Comments"]>["docs"]>[number]
    | NonNullable<NonNullable<ListCommentRepliesQuery["Comments"]>["docs"]>[number]
    | NonNullable<CommentByIdQuery["Comment"]>;

export type CommentReactionMutations = {
    likeMutation: LikeMutation;
    dislikeMutation: DislikeMutation;
};

export type CommentComposerMode = "create" | "reply" | "edit";

export type CommentComposerValues = {
    text: string;
    company?: string | null;
};

export type CommentCardProps = {
    comment: CommentThread;
    currentUser: CommentCurrentUser;
    depth?: number;
    commentEditPlaceholder: string;
    commentReplyPlaceholder: string;
    onDeleteAction: (payload: CommentDeletePayload) => Promise<void>;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
    onShare: (commentId: string) => void;
} & CommentReactionMutations;

export type CommentRepliesListProps = {
    parentCommentId: string;
    serverURL?: string | null;
    currentUser: CommentCurrentUser;
    commentEditPlaceholder: string;
    commentReplyPlaceholder: string;
    onDeleteAction: (payload: CommentDeletePayload) => Promise<void>;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
    onShare: (commentId: string) => void;
} & CommentReactionMutations;

export type EntityCommentsSectionDisplayProps = {
    className?: string;
    commentSectionStyles?: CommentSectionStyles;
    commentsCount?: number;
    currentUser: CommentCurrentUser;
    hasMore: boolean;
    isAnonymous: boolean;
    isError: boolean;
    isLoading: boolean;
    rootComments: CommentThread[];
    serverURL?: string | null;
    onDeleteAction: (payload: CommentDeletePayload) => Promise<void>;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
    onLoadMore: () => void;
    onLogin: () => void;
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
    onSignUp: () => void;
    onSubmitAction: (payload: CommentSubmitPayload) => Promise<void>;
} & CommentReactionMutations;
