import {
    Post_RelatedPosts_RelationTo,
    Post_RelatedPostsRelationshipInputRelationTo,
} from "../../../generated/graphql";

import type {
    PostDoc,
    PostRelatedTarget,
    RelatedTargetInputSelection,
    RelatedTargetSelection,
} from "./types";

type RelatedTargetEntity = {
    id: string;
    title?: string | null;
    name?: string | null;
    identityName?: string | null;
    serverURL?: string | null;
    image?: { url?: string | null } | null;
    heroImage?: { url?: string | null } | null;
    company?: {
        image?: { url?: string | null } | null;
        serverURL?: string | null;
    } | null;
};

const toAbsoluteImageUrl = (url: string | null | undefined, serverURL: string | null | undefined): string => {
    if (!url || !serverURL) {
        return url && /^https?:\/\//.test(url) ? url : "";
    }

    if (/^https?:\/\//.test(url)) {
        return url;
    }

    return new URL(url, serverURL).toString();
};

const getCompanyImageUrl = (company: { image?: { url?: string | null } | null; serverURL?: string | null } | null | undefined): string => {
    return toAbsoluteImageUrl(company?.image?.url, company?.serverURL);
};

const getRelatedSelectionLabel = (related: RelatedTargetEntity, relationTo: Post_RelatedPosts_RelationTo): string => {
    switch (relationTo) {
        case Post_RelatedPosts_RelationTo.Posts:
            return related.title || "Post";
        case Post_RelatedPosts_RelationTo.Companies:
            return related.name || "Company";
        case Post_RelatedPosts_RelationTo.Jobs:
            return related.title || "Job";
        case Post_RelatedPosts_RelationTo.Products:
            return related.name || "Product";
        case Post_RelatedPosts_RelationTo.Identities:
            return related.identityName || related.name || "Tribe";
        case Post_RelatedPosts_RelationTo.Startups:
            return related.title || "Venture";
    }

    return related.title || "Post";
};

export const getPostHeroImageUrl = (post?: PostDoc | null): string => {
    if (!post) {
        return "";
    }

    const directImage = toAbsoluteImageUrl(post.heroImage?.url, post.company?.serverURL);
    if (directImage) {
        return directImage;
    }

    const relatedImage = post.relatedPosts?.map((related) => getRelatedTargetImageUrl(related)).find(Boolean);
    return relatedImage || "";
};

export const getPostCompanyImageUrl = (post?: PostDoc | null): string => {
    return getCompanyImageUrl(post?.company);
};

export const getRelatedTargetImageUrl = (related?: PostRelatedTarget | null): string => {
    if (!related?.value || !related.relationTo) {
        return "";
    }

    const relatedValue = related.value as RelatedTargetEntity;

    switch (related.relationTo) {
        case Post_RelatedPosts_RelationTo.Posts:
            return toAbsoluteImageUrl(relatedValue.heroImage?.url, relatedValue.serverURL) || getCompanyImageUrl(relatedValue.company);
        case Post_RelatedPosts_RelationTo.Companies:
            return getCompanyImageUrl(relatedValue);
        case Post_RelatedPosts_RelationTo.Jobs:
        case Post_RelatedPosts_RelationTo.Products:
        case Post_RelatedPosts_RelationTo.Startups:
            return toAbsoluteImageUrl(relatedValue.image?.url, relatedValue.serverURL) || getCompanyImageUrl(relatedValue.company);
        case Post_RelatedPosts_RelationTo.Identities:
            return toAbsoluteImageUrl(relatedValue.image?.url, relatedValue.serverURL);
        default:
            return "";
    }
};

export const getRelatedTargetSelection = (related?: PostRelatedTarget | null): RelatedTargetSelection | null => {
    if (!related?.value || !related.relationTo) {
        return null;
    }

    const relatedValue = related.value as RelatedTargetEntity;

    return {
        relationTo: related.relationTo,
        value: relatedValue.id,
        label: getRelatedSelectionLabel(relatedValue, related.relationTo),
    };
};

export const getRelatedTargetInputSelection = (selection?: RelatedTargetSelection | null): RelatedTargetInputSelection | null => {
    if (!selection) {
        return null;
    }

    switch (selection.relationTo) {
        case Post_RelatedPosts_RelationTo.Posts:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Posts,
                value: selection.value,
            };
        case Post_RelatedPosts_RelationTo.Companies:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Companies,
                value: selection.value,
            };
        case Post_RelatedPosts_RelationTo.Jobs:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Jobs,
                value: selection.value,
            };
        case Post_RelatedPosts_RelationTo.Products:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Products,
                value: selection.value,
            };
        case Post_RelatedPosts_RelationTo.Identities:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Identities,
                value: selection.value,
            };
        case Post_RelatedPosts_RelationTo.Startups:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Startups,
                value: selection.value,
            };
    }

    return null;
};

export const getPostRelatedTargetHref = (related?: PostRelatedTarget | null): string => {
    if (!related?.value || !related.relationTo) {
        return "";
    }

    const relatedValue = related.value as RelatedTargetEntity;

    switch (related.relationTo) {
        case Post_RelatedPosts_RelationTo.Posts:
            return `/posts/${relatedValue.id}`;
        case Post_RelatedPosts_RelationTo.Companies:
            return `/companies/${relatedValue.id}`;
        case Post_RelatedPosts_RelationTo.Jobs:
            return `/jobs/${relatedValue.id}`;
        case Post_RelatedPosts_RelationTo.Products:
            return `/products-services/${relatedValue.id}`;
        case Post_RelatedPosts_RelationTo.Identities:
            return `/tribes/${relatedValue.id}`;
        case Post_RelatedPosts_RelationTo.Startups:
            return `/ventures/${relatedValue.id}`;
        default:
            return "";
    }
};

export const getPostRelatedTargetText = (related?: PostRelatedTarget | null): string => {
    if (!related?.value || !related.relationTo) {
        return "";
    }

    return getRelatedSelectionLabel(related.value as RelatedTargetEntity, related.relationTo);
};
