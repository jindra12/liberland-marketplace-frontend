import { marked } from "marked";

import {
    Post_RelatedPosts_RelationTo,
    Post_RelatedPostsRelationshipInputRelationTo,
} from "../../../generated/graphql";

import type { RelatedTargetSelection } from "../../shared/post/types";

export const stripMarkdownToText = (markdown: string): string => {
    const html = marked.parse(markdown, { async: false }) as string;
    return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
};

export const buildSeoDescription = (markdown: string): string => {
    const plainText = stripMarkdownToText(markdown).replace(/\s+/g, " ");
    return plainText.slice(0, 100);
};

export const resolvePostSeoDescription = (
    content: string | null | undefined,
    seoDescription: string | null | undefined,
    initialSeoDescription: string,
): string => {
    const generatedSeoDescription = buildSeoDescription(content ?? "");
    if (!seoDescription || seoDescription === initialSeoDescription) {
        return generatedSeoDescription;
    }

    return seoDescription;
};

export const slugifyPostTitle = (title: string): string => {
    return title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const buildRelatedTargetSelection = (
    related: RelatedTargetSelection | null | undefined,
): {
    relationTo: Post_RelatedPostsRelationshipInputRelationTo;
    value: string;
} | null => {
    if (!related) {
        return null;
    }

    switch (related.relationTo) {
        case Post_RelatedPosts_RelationTo.Posts:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Posts,
                value: related.value,
            };
        case Post_RelatedPosts_RelationTo.Companies:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Companies,
                value: related.value,
            };
        case Post_RelatedPosts_RelationTo.Jobs:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Jobs,
                value: related.value,
            };
        case Post_RelatedPosts_RelationTo.Products:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Products,
                value: related.value,
            };
        case Post_RelatedPosts_RelationTo.Identities:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Identities,
                value: related.value,
            };
        case Post_RelatedPosts_RelationTo.Startups:
            return {
                relationTo: Post_RelatedPostsRelationshipInputRelationTo.Startups,
                value: related.value,
            };
    }

    return null;
};
