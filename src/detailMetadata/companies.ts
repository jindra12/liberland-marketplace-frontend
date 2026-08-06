import type {
    CompanyByIdQuery,
    ListJobsByCompanyQuery,
    ListPostsByCompanyQuery,
    ListProductsByCompanyQuery,
    ListStartupsByCompanyQuery,
} from "../generated/graphql";
import {
    fetchListJobsByCompany,
    fetchListPostsByCompany,
    fetchListProductsByCompany,
    fetchListStartupsByCompany,
} from "../components/hooks";

import {
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";

type CompanyRelatedMetadata = {
    jobs: ListJobsByCompanyQuery["Jobs"];
    posts: ListPostsByCompanyQuery["Posts"];
    products: ListProductsByCompanyQuery["Products"];
    startups: ListStartupsByCompanyQuery["Startups"];
};

const buildCompanyRelatedItems = (company: NonNullable<CompanyByIdQuery["Company"]>, related?: CompanyRelatedMetadata) => {
    const relatedServerUrl = company.serverURL || "";
    const identityItems =
        company.identity?.name && company.identity?.id
            ? buildItemListJsonLd("Identity", [
                  {
                      label: company.identity.name,
                      url: buildDetailUrl("/tribes", company.identity.id, company.identity.serverURL),
                  },
              ])
            : [];

    const jobItems = buildItemListJsonLd(
        "Jobs",
        (related?.jobs?.docs || []).map((job) => ({
            label: job.title ?? "Job",
            url: buildDetailUrl("/jobs", job.id, job.serverURL),
        })),
    );
    const productItems = buildItemListJsonLd(
        "Products and services",
        (related?.products?.docs || []).map((product) => ({
            label: product.name ?? "Product",
            url: buildDetailUrl("/products-services", product.id, product.serverURL),
        })),
    );
    const startupItems = buildItemListJsonLd(
        "Ventures",
        (related?.startups?.docs || []).map((startup) => ({
            label: startup.title ?? "Venture",
            url: buildDetailUrl("/ventures", startup.id, relatedServerUrl),
        })),
    );
    const postItems = buildItemListJsonLd(
        "Posts",
        (related?.posts?.docs || []).map((post) => ({
            label: post.title ?? "Post",
            url: buildDetailUrl("/posts", post.id, relatedServerUrl),
        })),
    );

    return [...identityItems, ...jobItems, ...productItems, ...startupItems, ...postItems];
};

export const buildCompanyPageMetadata = (
    company: NonNullable<CompanyByIdQuery["Company"]>,
    canonicalPath: string,
    related?: CompanyRelatedMetadata,
) => {
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
            ...buildCompanyRelatedItems(company, related),
        ],
        {
            imageUrl: buildAbsoluteImageUrl(company.image?.url),
            imageAlt: company.image?.alt ?? company.image?.filename ?? detailLabel,
            ogType: "website",
            extraMetaTags: company.website ? [{ property: "og:see_also", content: company.website }] : [],
        },
    );
};

export const fetchCompanyRelatedMetadata = async (
    company: NonNullable<CompanyByIdQuery["Company"]>,
    _params: { id?: string; serverUrl?: string },
    serverUrl: string,
): Promise<CompanyRelatedMetadata> => {
    const url = company.serverURL || serverUrl;

    if (!url) {
        return {
            jobs: undefined,
            posts: undefined,
            products: undefined,
            startups: undefined,
        };
    }

    const [jobs, posts, products, startups] = await Promise.all([
        fetchListJobsByCompany({ companyId: company.id, page: 1, limit: 5 }, url),
        fetchListPostsByCompany({ companyId: company.id, page: 1, limit: 5 }, url),
        fetchListProductsByCompany({ companyId: company.id, page: 1, limit: 5 }, url),
        fetchListStartupsByCompany({ companyId: company.id, page: 1, limit: 5 }, url),
    ]);

    return {
        jobs: jobs.Jobs,
        posts: posts.Posts,
        products: products.Products,
        startups: startups.Startups,
    };
};
