import {
    ENTITY_COMMENTS_ANONYMOUS_NAME,
    ENTITY_COMMENTS_ANONYMOUS_USER_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
    ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
    ENTITY_COMMENTS_USER_FALLBACK_NAME,
} from "../../constants";
import type {
    AuthProfile,
    CommentCurrentUser,
    CommentDataItem,
    CommentDoc,
    CommentGrouping,
    CommentSectionStyles,
    CommentThemeVars,
    EntityCommentsThemeToken,
} from "../../types";

const getCommentTimestamp = (comment: CommentDoc): string | undefined => {
    const value = comment.updatedAt ?? comment.createdAt;
    return value ? String(value) : undefined;
};

const toCommentItem = (comment: CommentDoc): CommentDataItem => {
    if (comment.createdBy) {
        return {
            userId: `user:${comment.createdBy.email ?? comment.createdBy.id}`,
            comId: comment.id,
            fullName: comment.createdBy.name || comment.createdBy.email || ENTITY_COMMENTS_USER_FALLBACK_NAME,
            avatarUrl: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            userProfile: "",
            text: comment.content,
            timestamp: getCommentTimestamp(comment),
            replies: [],
        };
    }

    return {
        userId: `anon:${comment.anonymousHash ?? comment.id}`,
        comId: comment.id,
        fullName: ENTITY_COMMENTS_ANONYMOUS_NAME,
        avatarUrl: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
        userProfile: "",
        text: comment.content,
        timestamp: getCommentTimestamp(comment),
        replies: [],
    };
};

export const buildCommentData = (docs: CommentDoc[]): CommentDataItem[] => {
    const groupedComments = docs.reduce<CommentGrouping>(
        (result, comment) => {
            const parentId = comment.replyComment?.id;

            if (!parentId) {
                result.roots.push(comment);
                return result;
            }

            const replies = result.repliesByParent.get(parentId) ?? [];
            replies.push(toCommentItem(comment));
            result.repliesByParent.set(parentId, replies);
            return result;
        },
        {
            roots: [],
            repliesByParent: new Map<string, CommentDataItem[]>(),
        },
    );

    return groupedComments.roots.map((comment) => {
        const root = toCommentItem(comment);
        return {
            ...root,
            replies: groupedComments.repliesByParent.get(comment.id) ?? [],
        };
    });
};

export const getCommentCurrentUser = (isAuthenticated: boolean, profile?: AuthProfile): CommentCurrentUser => {
    if (isAuthenticated) {
        return {
            currentUserId: profile?.email ?? profile?.sub ?? ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
            currentUserImg: profile?.picture ?? ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            currentUserProfile: profile?.profile ?? "",
            currentUserFullName: profile?.name || profile?.email || ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
        };
    }

    return {
        currentUserId: ENTITY_COMMENTS_ANONYMOUS_USER_ID,
        currentUserImg: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
        currentUserProfile: "",
        currentUserFullName: ENTITY_COMMENTS_ANONYMOUS_NAME,
    };
};

export const getCommentThemeVars = (token: EntityCommentsThemeToken): CommentThemeVars => ({
    "--ecs-bg-overlay": token.colorBgContainer,
    "--ecs-bg-form": token.colorFillAlter,
    "--ecs-bg-elevated": token.colorBgElevated,
    "--ecs-text-primary": token.colorText,
    "--ecs-text-secondary": token.colorTextSecondary,
    "--ecs-text-placeholder": token.colorTextPlaceholder,
    "--ecs-border": token.colorBorder,
    "--ecs-border-secondary": token.colorBorderSecondary,
    "--ecs-primary": token.colorPrimary,
    "--ecs-primary-hover": token.colorPrimaryHover,
    "--ecs-font-family": token.fontFamily,
    "--ecs-radius": `${token.borderRadiusLG}px`,
});

export const getCommentSectionStyles = (token: EntityCommentsThemeToken): CommentSectionStyles => ({
    overlayStyle: {
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
        fontFamily: token.fontFamily,
        borderRadius: token.borderRadiusLG,
    },
    formStyle: {
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: token.padding,
    },
    inputStyle: {
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorder}`,
        fontFamily: token.fontFamily,
    },
    replyInputStyle: {
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorder}`,
        fontFamily: token.fontFamily,
    },
    submitBtnStyle: {
        border: `1px solid ${token.colorPrimary}`,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorPrimary,
        color: token.colorTextLightSolid,
    },
    cancelBtnStyle: {
        border: `1px solid ${token.colorFillSecondary}`,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorFillSecondary,
        color: token.colorTextSecondary,
    },
    hrStyle: {
        borderTopColor: token.colorBorderSecondary,
    },
    titleStyle: {
        color: token.colorTextHeading,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeHeading5,
        fontWeight: 800,
        lineHeight: token.lineHeightHeading5,
    },
});
