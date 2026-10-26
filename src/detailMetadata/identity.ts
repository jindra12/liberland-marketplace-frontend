import type {
    IdentityByIdQuery,
    ListCompaniesByIdentityQuery,
    ListJobsByIdentityQuery,
    ListProductsByIdentityQuery,
    ListStartupsByIdentityQuery,
} from "../generated/graphql";
import {
    fetchListCompaniesByIdentity,
    fetchListJobsByIdentity,
    fetchListProductsByIdentity,
    fetchListStartupsByIdentity,
} from "../server/queries";

import {
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildStandardDetailMetadata,
    normalizeWhitespace,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";
import { SITE_URL } from "../siteUrl";
import { TRIBE_ENTITIES } from "../tribeSearch/constants";
import { tribeCollectionPath, tribeSearchActions } from "../tribeSearch/utils";
import { buildTribeReference, getMetadataServerUrl } from "./utils";

type IdentityRelatedMetadata = {
    serverUrl: string;
    companies: ListCompaniesByIdentityQuery["Companies"];
    jobs: ListJobsByIdentityQuery["Jobs"];
    products: ListProductsByIdentityQuery["Products"];
    startups: ListStartupsByIdentityQuery["Startups"];
};

const buildIdentityRelatedItems = (
    related?: IdentityRelatedMetadata,
) => {
    const companyItems = buildItemListJsonLd(
        "Companies",
        (related?.companies?.docs || []).map((company) => ({
            label: company.name ?? "Company",
            url: buildDetailUrl("/companies", company.id, company.serverURL),
        })),
    );
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
            url: buildDetailUrl("/ventures", startup.id, startup.serverURL),
        })),
    );

    return [...companyItems, ...jobItems, ...productItems, ...startupItems];
};

export const buildIdentityPageMetadata = (
    identity: NonNullable<IdentityByIdQuery["Identity"]>,
    canonicalPath: string,
    related?: IdentityRelatedMetadata,
) => {
    const detailLabel = identity.name ?? "Tribe detail";
    const sourceServerUrl = related?.serverUrl || identity.serverURL || getMetadataServerUrl(canonicalPath);
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
                ...buildTribeReference(identity, getMetadataServerUrl(canonicalPath)),
                "@id": `${SITE_URL}${canonicalPath}`,
                name: detailLabel,
                description,
                image: buildAbsoluteImageUrl(identity.image?.url),
                identifier: identity.id,
                subjectOf: TRIBE_ENTITIES.map((entity) => ({
                    "@type": "CollectionPage",
                    url: `${SITE_URL}${tribeCollectionPath(entity, identity.id, sourceServerUrl)}`,
                    name: `${detailLabel}: ${entity}`,
                })),
                potentialAction: tribeSearchActions(),
            },
            ...buildIdentityRelatedItems(related),
        ],
        {
            imageUrl: buildAbsoluteImageUrl(identity.image?.url),
            imageAlt: identity.image?.alt ?? identity.image?.filename ?? detailLabel,
            ogType: "website",
        },
    );
};

export const fetchIdentityRelatedMetadata = async (
    identity: NonNullable<IdentityByIdQuery["Identity"]>,
    _params: { id?: string; serverUrl?: string },
    serverUrl: string,
): Promise<IdentityRelatedMetadata> => {
    const url = identity.serverURL || serverUrl;

    if (!url) {
        return {
            serverUrl,
            companies: undefined,
            jobs: undefined,
            products: undefined,
            startups: undefined,
        };
    }

    const [companies, jobs, products, startups] = await Promise.all([
        fetchListCompaniesByIdentity({ identityId: identity.id, page: 1, limit: 5 }, url),
        fetchListJobsByIdentity({ identityId: identity.id, page: 1, limit: 5 }, url),
        fetchListProductsByIdentity({ identityId: identity.id, page: 1, limit: 5 }, url),
        fetchListStartupsByIdentity({ identityId: identity.id, page: 1, limit: 5 }, url),
    ]);

    return {
        serverUrl: url,
        companies: companies.Companies,
        jobs: jobs.Jobs,
        products: products.Products,
        startups: startups.Startups,
    };
};
