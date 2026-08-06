import type { ListPublishedSyndicationUrlsQuery } from "../generated/graphql";

import { buildActionSentence, buildStandardDetailMetadata, normalizeWhitespace } from "./shared";
import { buildSiteUrl } from "../siteUrl";

type SyndicationDetail = NonNullable<NonNullable<ListPublishedSyndicationUrlsQuery["Syndications"]>["docs"]>[number];

export const buildSyndicationPageMetadata = (syndication: SyndicationDetail, canonicalPath: string) => {
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
                url: buildSiteUrl(canonicalPath),
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
