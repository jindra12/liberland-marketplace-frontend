import type { CommentDetailQuery } from "../generated/graphql";

import {
    SITE_URL,
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildExcerpt,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";

export const buildCommentPageMetadata = (
    comment: NonNullable<CommentDetailQuery["Comment"]>,
    canonicalPath: string,
) => {
    const commentAuthor = comment.createdBy?.name ?? "Anonymous";
    const commentContext = comment.company?.name ? ` on ${comment.company.name}` : "";
    const detailLabel = `Comment by ${commentAuthor}${commentContext}`;
    const baseDescription = comment.content
        ? `${detailLabel}: ${buildExcerpt(comment.content, 180)}`
        : `${detailLabel}.`;
    const description = normalizeWhitespace(
        `${baseDescription} ${buildActionSentence([
            "read the discussion context",
            "open the related company or post",
            "reply to the comment",
            "like it if you are signed in",
        ])}`,
    );

    const imageUrl = buildAbsoluteImageUrl(comment.company?.image?.url);
    const imageAlt = comment.company?.image?.alt ?? comment.company?.image?.filename ?? comment.company?.name ?? detailLabel;

    return buildStandardDetailMetadata(
        "Comments",
        "/comments",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Comment",
                text: comment.content,
                dateCreated: comment.createdAt,
                dateModified: comment.updatedAt,
                author: comment.createdBy
                    ? {
                          "@type": "Person",
                          identifier: comment.createdBy.id,
                          name: comment.createdBy.name,
                      }
                    : undefined,
                about: comment.company
                    ? {
                          "@type": "Organization",
                          identifier: comment.company.id,
                          name: comment.company.name,
                          image: buildAbsoluteImageUrl(comment.company.image?.url),
                      }
                    : undefined,
                mainEntityOfPage: `${SITE_URL}${canonicalPath}`,
                interactionStatistic:
                    comment.likeCount !== null && comment.likeCount !== undefined
                        ? [
                              {
                                  "@type": "InteractionCounter",
                                  interactionType: { "@type": "LikeAction" },
                                  userInteractionCount: comment.likeCount,
                              },
                          ]
                        : undefined,
                commentCount: comment.replyCount ?? undefined,
            },
        ],
        {
            imageUrl,
            imageAlt,
            ogType: "article",
            extraMetaTags: [
                ...(comment.createdAt ? [{ property: "article:published_time", content: comment.createdAt }] : []),
                ...(comment.updatedAt ? [{ property: "article:modified_time", content: comment.updatedAt }] : []),
                ...(comment.createdBy?.name ? [{ property: "article:author", content: comment.createdBy.name }] : []),
                ...(comment.company?.name ? [{ property: "article:section", content: comment.company.name }] : []),
            ],
        },
    );
};
