import type { JobByIdQuery } from "../generated/graphql";

import {
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";

export const buildJobPageMetadata = (job: NonNullable<JobByIdQuery["Job"]>, canonicalPath: string) => {
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
            ...buildItemListJsonLd(
                "Company",
                job.company?.name && job.company?.id
                    ? [
                          {
                              label: job.company.name,
                              url: buildDetailUrl("/companies", job.company.id, job.company.serverURL),
                          },
                      ]
                    : [],
            ),
            ...buildItemListJsonLd(
                "Identity",
                job.company?.identity?.name && job.company?.identity?.id
                    ? [
                          {
                              label: job.company.identity.name,
                              url: buildDetailUrl("/tribes", job.company.identity.id, job.company.identity.serverURL),
                          },
                      ]
                    : [],
            ),
        ],
        {
            imageUrl: buildAbsoluteImageUrl(job.image?.url ?? job.company?.image?.url),
            imageAlt: job.image?.alt ?? job.image?.filename ?? job.title ?? detailLabel,
            ogType: "website",
        },
    );
};
