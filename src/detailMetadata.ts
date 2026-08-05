import type {
    CommentDetailQuery,
    CompanyByIdQuery,
    IdentityByIdQuery,
    JobByIdQuery,
    ListPublishedSyndicationUrlsQuery,
    PostByIdQuery,
    ProductByIdQuery,
    StartupByIdQuery,
} from "./generated/graphql";

import { stripMarkdownToText } from "./components/publish/postForm/utils";

const SITE_NAME = "NSwap";
const SITE_URL = "https://nswap.io";

const normalizeWhitespace = (value: string): string => {
    return value.replace(/\s+/g, " ");
};

const buildExcerpt = (value: string, maxLength: number): string => {
    return normalizeWhitespace(stripMarkdownToText(value).replace(/<[^>]+>/g, " ")).slice(0, maxLength);
};

const buildActionSentence = (actions: string[]): string => {
    return `On this page you can ${actions.join(", ")}.`;
};

const buildAbsoluteImageUrl = (value: string | null | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    return value.startsWith("/") ? `${SITE_URL}${value}` : `${SITE_URL}/${value}`;
};

const ensureSiteSuffix = (value: string): string => {
    if (value.endsWith(` | ${SITE_NAME}`) || value.endsWith(` ${SITE_NAME}`)) {
        return value;
    }

    return `${value} | ${SITE_NAME}`;
};

const buildDetailJsonLd = (
    sectionName: string,
    sectionPath: string,
    detailLabel: string,
    description: string,
    canonicalPath: string,
    extraJsonLd: Record<string, unknown>[] = [],
): Record<string, unknown>[] => {
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: ensureSiteSuffix(detailLabel),
            url: `${SITE_URL}${canonicalPath}`,
            description,
            isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
            },
            mainEntityOfPage: `${SITE_URL}${canonicalPath}`,
            potentialAction: {
                "@type": "ReadAction",
                target: `${SITE_URL}${canonicalPath}`,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: sectionName,
                    item: `${SITE_URL}${sectionPath}`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: detailLabel,
                    item: `${SITE_URL}${canonicalPath}`,
                },
            ],
        },
        ...extraJsonLd,
    ];
};

const decodeHexSegment = (value: string): string => {
    if (!value || value.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(value)) {
        return "";
    }

    const bytes = value.match(/.{1,2}/g);
    if (!bytes) {
        return "";
    }

    return bytes.map((segment) => String.fromCharCode(Number.parseInt(segment, 16))).join("");
};

export type DetailPageMetadata = {
    title: string;
    description: string;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
    imageUrl?: string;
    imageAlt?: string;
    ogType?: string;
    extraMetaTags?: Array<{
        content: string;
        name?: string;
        property?: string;
    }>;
};

type DetailPageMetadataExtras = {
    imageUrl?: string;
    imageAlt?: string;
    ogType?: string;
    extraMetaTags?: Array<{
        content: string;
        name?: string;
        property?: string;
    }>;
};

export const decodeServerUrlSegment = (value: string): string => {
    return decodeHexSegment(value);
};

export const buildStandardDetailMetadata = (
    sectionName: string,
    sectionPath: string,
    detailLabel: string,
    description: string,
    canonicalPath: string,
    extraJsonLd: Record<string, unknown>[] = [],
    extras: DetailPageMetadataExtras = {},
): DetailPageMetadata => {
    return {
        title: ensureSiteSuffix(detailLabel),
        description,
        canonicalPath,
        jsonLd: buildDetailJsonLd(sectionName, sectionPath, detailLabel, description, canonicalPath, extraJsonLd),
        imageUrl: extras.imageUrl,
        imageAlt: extras.imageAlt,
        ogType: extras.ogType,
        extraMetaTags: extras.extraMetaTags,
    };
};

export const buildPostPageMetadata = (
    post: NonNullable<PostByIdQuery["Post"]>,
    canonicalPath: string,
): DetailPageMetadata => {
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

export const buildCommentPageMetadata = (
    comment: NonNullable<CommentDetailQuery["Comment"]>,
    canonicalPath: string,
): DetailPageMetadata => {
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

export const buildCompanyPageMetadata = (
    company: NonNullable<CompanyByIdQuery["Company"]>,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = company.name ?? "Company detail";
    const description = normalizeWhitespace(
        `${company.description ?? `Detail page for ${company.name ?? "a company"}.`} ${buildActionSentence([
            "view the company profile",
            "browse linked jobs, products, posts, and ventures",
            "inspect verification and contact details",
            "follow related identity links",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Companies",
        "/companies",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: detailLabel,
                description,
                url: company.website ?? company.serverURL,
                image: buildAbsoluteImageUrl(company.image?.url),
                telephone: company.phone,
                email: company.email,
                sameAs: company.identity?.website ? [company.identity.website] : undefined,
                identifier: company.id,
            },
        ],
        {
            imageUrl: buildAbsoluteImageUrl(company.image?.url),
            imageAlt: company.image?.alt ?? company.image?.filename ?? detailLabel,
            ogType: "website",
            extraMetaTags: [
                ...(company.website ? [{ property: "og:see_also", content: company.website }] : []),
            ],
        },
    );
};

export const buildIdentityPageMetadata = (
    identity: NonNullable<IdentityByIdQuery["Identity"]>,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = identity.name ?? "Tribe detail";
    const description = normalizeWhitespace(
        `${identity.description ?? `Detail page for ${identity.name ?? "a tribe"}.`} ${buildActionSentence([
            "view the tribe profile",
            "browse linked companies, jobs, products, and ventures",
            "follow the tribe's marketplace footprint",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Tribes",
        "/tribes",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: detailLabel,
                description,
                url: identity.website ?? identity.serverURL,
                image: buildAbsoluteImageUrl(identity.image?.url),
                identifier: identity.id,
            },
        ],
        {
            imageUrl: buildAbsoluteImageUrl(identity.image?.url),
            imageAlt: identity.image?.alt ?? identity.image?.filename ?? detailLabel,
            ogType: "website",
        },
    );
};

export const buildJobPageMetadata = (
    job: NonNullable<JobByIdQuery["Job"]>,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = job.title ?? "Job detail";
    const salaryRange =
        job.salaryRange?.min !== null &&
        job.salaryRange?.min !== undefined &&
        job.salaryRange?.max !== null &&
        job.salaryRange?.max !== undefined
            ? ` Salary range ${job.salaryRange.min} to ${job.salaryRange.max}${job.salaryRange.currency ? ` ${job.salaryRange.currency}` : ""}.`
            : "";
    const description = normalizeWhitespace(
        `${job.description ?? `Detail page for ${job.title ?? "a job listing"}.`}${salaryRange} ${buildActionSentence([
            "review the job requirements",
            "see the company and identity context",
            "open the application link if available",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Jobs",
        "/jobs",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "JobPosting",
                title: detailLabel,
                description,
                datePosted: job.postedAt,
                employmentType: job.employmentType,
                jobLocation: job.location ? { "@type": "Place", name: job.location } : undefined,
                directApply: Boolean(job.applyUrl),
                applyUrl: job.applyUrl,
                hiringOrganization: job.company
                    ? {
                          "@type": "Organization",
                          identifier: job.company.id,
                          name: job.company.name,
                          url: job.company.serverURL,
                          logo: buildAbsoluteImageUrl(job.company.image?.url),
                      }
                    : undefined,
                baseSalary:
                    job.salaryRange?.min !== null &&
                    job.salaryRange?.min !== undefined &&
                    job.salaryRange?.max !== null &&
                    job.salaryRange?.max !== undefined
                        ? {
                              "@type": "MonetaryAmount",
                              currency: job.salaryRange.currency,
                              value: {
                                  "@type": "QuantitativeValue",
                                  minValue: job.salaryRange.min,
                                  maxValue: job.salaryRange.max,
                              },
                          }
                        : undefined,
                identifier: job.id,
                image: buildAbsoluteImageUrl(job.image?.url),
            },
        ],
        {
            imageUrl: buildAbsoluteImageUrl(job.image?.url ?? job.company?.image?.url),
            imageAlt: job.image?.alt ?? job.image?.filename ?? job.title ?? detailLabel,
            ogType: "website",
        },
    );
};

export const buildProductPageMetadata = (
    product: NonNullable<ProductByIdQuery["Product"]>,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = product.name ?? "Product or service detail";
    const priceDetails = [
        product.priceInUSDEnabled && product.priceInUSD !== null && product.priceInUSD !== undefined
            ? `USD ${product.priceInUSD}`
            : "",
        product.priceInETH !== null && product.priceInETH !== undefined ? `${product.priceInETH} ETH` : "",
        product.priceInSOL !== null && product.priceInSOL !== undefined ? `${product.priceInSOL} SOL` : "",
        product.priceInTRX !== null && product.priceInTRX !== undefined ? `${product.priceInTRX} TRX` : "",
    ]
        .filter((value) => value !== "")
        .join(", ");
    const description = normalizeWhitespace(
        `${product.description ?? `Detail page for ${product.name ?? "a product or service"}.`}${
            priceDetails ? ` Prices include ${priceDetails}.` : ""
        } ${buildActionSentence([
            "compare prices and inventory",
            "review variants and parameters",
            "open the company profile",
            "place an order if the item is orderable",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Products and services",
        "/products-services",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Product",
                name: detailLabel,
                description,
                image: buildAbsoluteImageUrl(product.image?.url),
                sku: product.id,
                brand: product.company
                    ? {
                          "@type": "Organization",
                          identifier: product.company.id,
                          name: product.company.name,
                          url: product.company.serverURL,
                      }
                    : undefined,
                offers:
                    product.orderable || product.priceInUSDEnabled
                        ? {
                              "@type": "Offer",
                              availability:
                                  product.inventory !== null && product.inventory !== undefined && product.inventory > 0
                                      ? "https://schema.org/InStock"
                                      : "https://schema.org/OutOfStock",
                              price:
                                  product.priceInUSD ??
                                  product.priceInETH ??
                                  product.priceInSOL ??
                                  product.priceInTRX,
                              priceCurrency: product.priceInUSDEnabled ? "USD" : undefined,
                              url: product.url ?? `${SITE_URL}${canonicalPath}`,
                          }
                        : undefined,
                identifier: product.id,
            },
        ],
        {
            imageUrl: buildAbsoluteImageUrl(product.image?.url ?? product.company?.image?.url),
            imageAlt: product.image?.filename ?? detailLabel,
            ogType: "product",
            extraMetaTags:
                product.priceInUSD !== null && product.priceInUSD !== undefined
                    ? [
                          {
                              property: "product:price:amount",
                              content: String(product.priceInUSD),
                          },
                          {
                              property: "product:price:currency",
                              content: "USD",
                          },
                      ]
                    : [],
        },
    );
};

export const buildStartupPageMetadata = (
    startup: NonNullable<StartupByIdQuery["Startup"]>,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = startup.title ?? "Venture detail";
    const fundingDetails =
        startup.fundsNeeded?.amount !== null && startup.fundsNeeded?.amount !== undefined
            ? ` Funding goal ${startup.fundsNeeded.amount}${startup.fundsNeeded.currency ? ` ${startup.fundsNeeded.currency}` : ""}.`
            : "";
    const description = normalizeWhitespace(
        `${startup.description ?? `Detail page for ${startup.title ?? "a venture"}.`}${fundingDetails} ${buildActionSentence([
            "review the startup overview",
            "see what the team is looking for",
            "open the connected company and identity pages",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Ventures",
        "/ventures",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: detailLabel,
                description,
                image: buildAbsoluteImageUrl(startup.image?.url),
                foundingDate: startup.createdAt,
                url: startup.identity?.website ?? startup.company?.serverURL,
                identifier: startup.id,
            },
        ],
        {
            imageUrl: buildAbsoluteImageUrl(startup.image?.url),
            imageAlt: startup.image?.alt ?? startup.image?.filename ?? detailLabel,
            ogType: "website",
        },
    );
};

type SyndicationDetail = NonNullable<NonNullable<ListPublishedSyndicationUrlsQuery["Syndications"]>["docs"]>[number];

export const buildSyndicationPageMetadata = (
    syndication: SyndicationDetail,
    canonicalPath: string,
): DetailPageMetadata => {
    const detailLabel = syndication.name ?? syndication.url ?? "Syndicated URL detail";
    const description = normalizeWhitespace(
        `${syndication.description ?? `Detail page for ${syndication.name ?? syndication.url ?? "a syndicated URL"}.`} ${buildActionSentence([
            "review the syndicated endpoint",
            "see whether it auto-enables locally",
            "check the NSFW status before enabling it",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Syndication",
        "/syndication",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: detailLabel,
                description,
                url: `${SITE_URL}${canonicalPath}`,
                about: {
                    "@type": "CreativeWork",
                    name: syndication.name ?? syndication.url ?? "Syndicated URL",
                },
                identifier: syndication.url,
            },
        ],
        {
            ogType: "website",
            extraMetaTags: [
                ...(syndication.nsfw !== null && syndication.nsfw !== undefined
                    ? [{ name: "nsfw", content: String(Boolean(syndication.nsfw)) }]
                    : []),
                ...(syndication.autoEnable !== null && syndication.autoEnable !== undefined
                    ? [{ name: "auto-enable", content: String(Boolean(syndication.autoEnable)) }]
                    : []),
            ],
        },
    );
};
