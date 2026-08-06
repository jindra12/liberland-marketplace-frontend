import type { StartupByIdQuery } from "../generated/graphql";

import {
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";

export const buildStartupPageMetadata = (
    startup: NonNullable<StartupByIdQuery["Startup"]>,
    canonicalPath: string,
) => {
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
            ...buildItemListJsonLd(
                "Company",
                startup.company?.name && startup.company?.id
                    ? [
                          {
                              label: startup.company.name,
                              url: buildDetailUrl("/companies", startup.company.id, startup.company.serverURL),
                          },
                      ]
                    : [],
            ),
            ...buildItemListJsonLd(
                "Identity",
                startup.identity?.name && startup.identity?.id
                    ? [
                          {
                              label: startup.identity.name,
                              url: buildDetailUrl("/tribes", startup.identity.id, startup.identity.serverURL),
                          },
                      ]
                    : [],
            ),
        ],
        {
            imageUrl: buildAbsoluteImageUrl(startup.image?.url),
            imageAlt: startup.image?.alt ?? startup.image?.filename ?? detailLabel,
            ogType: "website",
        },
    );
};
