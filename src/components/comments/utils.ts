import {
    ENTITY_COMMENTS_ANONYMOUS_NAME,
    ENTITY_COMMENTS_ANONYMOUS_USER_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
    ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
} from "../../constants";
import type { Comment } from "../../generated/graphql";
import type { AuthProfile } from "../../types";
import { routes } from "../../routes";
import { formatPrettyDate } from "../../utils/date";
import type { CommentCurrentUser, CommentThread } from "./types";

const getCommentTimestamp = (comment: Pick<CommentThread, "updatedAt" | "createdAt">): string | undefined => {
    const value = comment.updatedAt ?? comment.createdAt;
    return formatPrettyDate(value);
};

export const getCommentDisplayName = (comment: CommentThread): string => {
    if (comment.company?.name) {
        return comment.company.name;
    }

    if (comment.createdBy) {
        return comment.createdBy.name || comment.createdBy.email || comment.createdBy.id;
    }

    return ENTITY_COMMENTS_ANONYMOUS_NAME;
};

const getCompanyAvatarUrl = (company: CommentThread["company"]): string => {
    if (!company?.image?.url || !company.serverURL) {
        return ENTITY_COMMENTS_DEFAULT_AVATAR_URL;
    }

    return new URL(company.image.url, company.serverURL).toString();
};

export const getCommentAvatarUrl = (comment: CommentThread): string => getCompanyAvatarUrl(comment.company);

export const getCommentShareUrl = (comment: Comment): string => routes.comments.detail.getLink(comment);

export const copyCommentLink = async (comment: Comment): Promise<void> => {
    await navigator.clipboard.writeText(`${window.location.origin}${getCommentShareUrl(comment)}`);
};

export const isCommentOwnedByCurrentUser = (comment: CommentThread, currentUserId: string): boolean => {
    if (!comment.createdBy) {
        return false;
    }

    return comment.createdBy.email === currentUserId || comment.createdBy.id === currentUserId;
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

export const getCommentTimestampText = (comment: Pick<CommentThread, "updatedAt" | "createdAt">): string | undefined => getCommentTimestamp(comment);
