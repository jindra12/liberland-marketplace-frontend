import type { CSSProperties, ComponentProps, ReactNode } from "react";
import type { OidcStandardClaims } from "oidc-client-ts";
import type { CommentSection } from "react-comments-section";
import type { Space, Tag } from "antd";
import type {
    Comment_ReplyPostRelationshipInputRelationTo,
    Company,
    Identity,
    Job,
    ListCommentsByTargetQuery,
    Product,
} from "./generated/graphql";

export type SearchScope = "jobs" | "companies" | "identities" | "products";
export type SearchOption = { value: string; label?: ReactNode, image?: string | null };
export type DocType = Partial<Identity | Company | Job | Product>;

export type IdentityTagItem = {
    id: string;
    name: string;
};

export type IdentityTagLinkProps = {
    identity: IdentityTagItem;
    color?: ComponentProps<typeof Tag>["color"];
    icon?: ReactNode;
};

export type EntitySubListSectionProps = {
    title: string;
    children: ReactNode;
};

export type IdentityGroupsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    emptyText?: ReactNode;
};

export type CompanyContactLinksProps = {
    identity?: IdentityTagItem;
    website?: string | null;
    email?: unknown;
    phone?: string | null;
    className?: string;
};

export type IdentityAccessTagsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    showIcons?: boolean;
    hideWhenEmpty?: boolean;
    keyPrefix?: string;
};

export type JobMetaTagsProps = {
    showCompany?: boolean;
    companyName?: string | null;
    companyIdentity?: IdentityTagItem;
    positions?: string | null;
    bounty?: string | null;
    isInactive?: boolean;
    className?: string;
};

export type JobDetailsSummaryProps = {
    companyName?: string | null;
    location?: string | null;
    employmentType?: string | null;
    salary?: string | null;
    bounty?: string | null;
    positions?: string | null;
    postedAt?: string | null;
    isInactive?: boolean;
    showCompanyIcon?: boolean;
    metaSize?: ComponentProps<typeof Space>["size"];
};

export type EntityCommentsSectionProps = {
    targetId: string;
    relationTo: Comment_ReplyPostRelationshipInputRelationTo;
    title?: string;
    limit?: number;
    placeholder?: string;
    className?: string;
};

export type CommentDoc = NonNullable<NonNullable<ListCommentsByTargetQuery["Comments"]>["docs"]>[number];
export type CommentDataItem = ComponentProps<typeof CommentSection>["commentData"][number];
export type CommentCurrentUser = NonNullable<ComponentProps<typeof CommentSection>["currentUser"]>;
export type AuthProfile = OidcStandardClaims;
export type CommentSubmitPayload = { text: string };
export type CommentReplyPayload = { text: string; repliedToCommentId: string };
export type CommentEditPayload = { text: string; comId: string };
export type CommentDeletePayload = { comIdToDelete: string };
export type CommentGrouping = {
    roots: CommentDoc[];
    repliesByParent: Map<string, CommentDataItem[]>;
};
export type CommentThemeVars = CSSProperties & {
    "--ecs-bg-overlay": string;
    "--ecs-bg-form": string;
    "--ecs-bg-elevated": string;
    "--ecs-text-primary": string;
    "--ecs-text-secondary": string;
    "--ecs-text-placeholder": string;
    "--ecs-border": string;
    "--ecs-border-secondary": string;
    "--ecs-primary": string;
    "--ecs-primary-hover": string;
    "--ecs-font-family": string;
    "--ecs-radius": string;
};
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

export type JobDerivedInput = {
    bounty?: {
        amount?: number | null;
        currency?: string | null;
    } | null;
    positions?: number | null;
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    company?: {
        identity?: IdentityTagItem | null;
        allowedIdentities?: IdentityTagItem[] | null;
        disallowedIdentities?: IdentityTagItem[] | null;
    } | null;
};

export type JobIdentityDedupeBy = "id" | "name";
