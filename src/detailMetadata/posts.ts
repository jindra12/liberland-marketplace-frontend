import type { PostByIdQuery } from "../generated/graphql";

import {
    SITE_URL,
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildExcerpt,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";

export const buildPostPageMetadata = (
    post: NonNullable<PostByIdQuery["Post"]>,
    canonicalPath: string,
) => {
    const detailLabel = post.meta?.title ?? post.title ?? "Post detail";
    const baseDescription =
        post.meta?.description ??
        (post.content ? buildExcerpt(post.content, 180) : `Detail page for ${post.company?.name ?? "a published post"}.`);
    const description = normalizeWhitespace(
        `${baseDescription} ${buildActionSentence([
            "read the full post",
            "open the connected company profile",
            "view related posts",
            "check likes and publication details",
        ])}`,
    );

    const imageUrl = buildAbsoluteImageUrl(post.heroImage?.url ?? post.company?.image?.url);
    const imageAlt = post.heroImage?.alt ?? post.heroImage?.filename ?? detailLabel;

    return buildStandardDetailMetadata(
        "Posts",
        "/posts",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: detailLabel,
                description,
                datePublished: post.publishedAt ?? post.createdAt,
                dateModified: post.updatedAt,
                image: buildAbsoluteImageUrl(post.heroImage?.url),
                author: post.createdBy
                    ? {
                          "@type": "Person",
                          identifier: post.createdBy.id,
                          name: post.createdBy.name,
                      }
                    : undefined,
                publisher: post.company
                    ? {
                          "@type": "Organization",
                          identifier: post.company.id,
                          name: post.company.name,
                          url: post.company.serverURL,
                          logo: buildAbsoluteImageUrl(post.company.image?.url),
                      }
                    : undefined,
                about: post.company
                    ? {
                          "@type": "Organization",
                          identifier: post.company.id,
                          name: post.company.name,
                      }
                    : undefined,
                mainEntityOfPage: `${SITE_URL}${canonicalPath}`,
                interactionStatistic:
                    post.likeCount !== null && post.likeCount !== undefined
                        ? [
                              {
                                  "@type": "InteractionCounter",
                                  interactionType: { "@type": "LikeAction" },
                                  userInteractionCount: post.likeCount,
                              },
                          ]
                        : undefined,
            },
            ...buildItemListJsonLd(
                "Company",
                post.company?.name && post.company?.id
                    ? [
                          {
                              label: post.company.name,
                              url: buildDetailUrl("/companies", post.company.id, post.company.serverURL),
                          },
                      ]
                    : [],
            ),
        ],
        {
            imageUrl,
            imageAlt,
            ogType: "article",
            extraMetaTags: [
                ...(post.publishedAt ? [{ property: "article:published_time", content: post.publishedAt }] : []),
                ...(post.updatedAt ? [{ property: "article:modified_time", content: post.updatedAt }] : []),
                ...(post.createdBy?.name ? [{ property: "article:author", content: post.createdBy.name }] : []),
                ...(post.company?.name ? [{ property: "article:section", content: post.company.name }] : []),
            ],
        },
    );
};
