import { ResultStatusType } from "antd/es/result";
import {
    AuthProfile,
    CommentCurrentUser,
    CommentDataItem,
    CommentDoc,
    CommentGrouping,
    CommentSectionStyles,
    CommentThemeVars,
    DocType,
    EntityCommentsThemeToken,
} from "./types";
import { Job_EmploymentType } from "./generated/graphql";
import { BACKEND_URL } from "./gqlFetcher";
import { isCryptoCurrency } from "./components/publish/constants";
import {
    ENTITY_COMMENTS_ANONYMOUS_NAME,
    ENTITY_COMMENTS_ANONYMOUS_USER_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
    ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
    ENTITY_COMMENTS_USER_FALLBACK_NAME,
} from "./constants";

export const convertStatusCode = (status?: number): ResultStatusType => {
    if (status === 403 || status === 404 || status === 500) {
        return status;
    }
    return "error";
};

export const getErrorMessage = (status?: number) => {
    switch (status) {
        case 403: return "Forbidden";
        case 404: return "Not Found";
        default: return "Try later";
    }
};

export const timeAgo = (date: string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, "year"],
        [2592000, "month"],
        [604800, "week"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ];
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
};

const getCryptoFractionDigits = (currency: string, fallback: number): number =>
    isCryptoCurrency(currency) ? 6 : fallback;

export const formatSalary = (min?: number | null, max?: number | null, currency?: string | null): string | null => {
    if (min == null && max == null) return null;
    const cur = currency || "USD";
    const digits = getCryptoFractionDigits(cur, 0);
    const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: digits });
    if (min != null && max != null) return `${cur} ${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `From ${cur} ${fmt(min)}`;
    return `Up to ${cur} ${fmt(max!)}`;
};

export const formatBounty = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const cur = currency || "USD";
    const fallback = Number.isInteger(amount) ? 0 : 2;
    const maxFractionDigits = getCryptoFractionDigits(cur, fallback);
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${cur} ${fmt}`;
};

export const formatPrice = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const cur = currency || "USD";
    const fallback = Number.isInteger(amount) ? 0 : 2;
    const maxFractionDigits = getCryptoFractionDigits(cur, fallback);
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${cur} ${fmt}`;
};

export const formatPositions = (positions?: number | null): string | null => {
    if (!positions || positions === 1) return null;
    const maxFractionDigits = Number.isInteger(positions) ? 0 : 2;
    const value = positions.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${value} position${positions === 1 ? "" : "s"}`;
};

const employmentTypeLabels: Record<Job_EmploymentType, string> = {
    [Job_EmploymentType.FullTime]: "Full-time",
    [Job_EmploymentType.PartTime]: "Part-time",
    [Job_EmploymentType.Contract]: "Contract",
    [Job_EmploymentType.Internship]: "Internship",
    [Job_EmploymentType.Gig]: "Gig",
};

export const formatEmploymentType = (type?: Job_EmploymentType | null): string | null => {
    return type ? employmentTypeLabels[type] ?? null : null;
};

export const getImage = (doc?: DocType) => {
    switch (doc?.__typename) {
        case "Company":
        case "Identity":
        case "Job":
        case "Product": {
            const url = doc?.image?.url;
            return url ? `${BACKEND_URL}${url}` : undefined;
        }
        default:
            return undefined;
    }
};

export const getCommentTimestamp = (comment: CommentDoc): string | undefined => {
    const value = comment.updatedAt ?? comment.createdAt;
    return value ? String(value) : undefined;
};

export const toCommentItem = (comment: CommentDoc): CommentDataItem => {
    if (comment.createdBy) {
        const fullName = comment.createdBy.name || comment.createdBy.email || ENTITY_COMMENTS_USER_FALLBACK_NAME;
        return {
            userId: `user:${comment.createdBy.email || comment.createdBy.id}`,
            comId: comment.id,
            fullName,
            avatarUrl: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            userProfile: "",
            text: comment.content,
            timestamp: getCommentTimestamp(comment),
            replies: [],
        };
    }

    return {
        userId: `anon:${comment.anonymousHash || comment.id}`,
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
    const { roots, repliesByParent } = docs.reduce<CommentGrouping>((acc, comment) => {
        const parentId = comment.replyComment?.id;
        if (!parentId) {
            acc.roots.push(comment);
            return acc;
        }

        const existingReplies = acc.repliesByParent.get(parentId) || [];
        existingReplies.push(toCommentItem(comment));
        acc.repliesByParent.set(parentId, existingReplies);
        return acc;
    }, {
        roots: [],
        repliesByParent: new Map<string, CommentDataItem[]>(),
    });

    return roots.map((comment) => {
        const root = toCommentItem(comment);
        return {
            ...root,
            replies: repliesByParent.get(comment.id) || [],
        };
    });
};

export const getCommentCurrentUser = (
    isAuthenticated: boolean,
    profile?: AuthProfile
): CommentCurrentUser => {
    if (isAuthenticated) {
        const email = profile?.email;
        const name = profile?.name;
        const picture = profile?.picture;
        const sub = profile?.sub;
        const profileLink = profile?.profile || "";

        return {
            currentUserId: email || sub || ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
            currentUserImg: picture || ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            currentUserProfile: profileLink,
            currentUserFullName: name || email || ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
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
        fontSize: token.fontSizeHeading4,
    },
});
