import {
    ListCompaniesDocument,
    ListIdentitiesDocument,
    ListJobsDocument,
    ListPostsDocument,
    ListProductsDocument,
    ListStartupsDocument,
} from "./generated/graphql";
import type {
    ListCompaniesQuery,
    ListIdentitiesQuery,
    ListJobsQuery,
    ListPostsQuery,
    ListProductsQuery,
    ListStartupsQuery,
} from "./generated/graphql";
import { BACKEND_URL } from "./gqlFetcher";
import { buildDetailUrl } from "./detailMetadata/related";
import { SEO_BY_ROUTE, type SeoCollectionItem, type SeoCollectionPageData } from "./shellPage/seo";

type CollectionRoute = "/companies" | "/tribes" | "/jobs" | "/products-services" | "/ventures" | "/posts";

type CollectionVariables = {
    page: number;
    limit: number;
    sort: string;
};

type GraphQLResponse<TData> = {
    data?: TData;
    errors?: Array<{ message: string }>;
};

type CollectionQueryData =
    | ListCompaniesQuery
    | ListIdentitiesQuery
    | ListJobsQuery
    | ListPostsQuery
    | ListProductsQuery
    | ListStartupsQuery;

const fetchCollection = async <TData>(query: string, variables: CollectionVariables): Promise<TData> => {
    const response = await fetch(`${BACKEND_URL}/api/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`Collection metadata request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GraphQLResponse<TData>;
    if (payload.errors?.length) {
        throw new Error(payload.errors[0].message);
    }

    if (!payload.data) {
        throw new Error("Collection metadata response did not contain data");
    }

    return payload.data;
};

const toCollectionItem = (
    name: string,
    url: string,
    description: string | null | undefined,
    type: string,
    attributes: SeoCollectionItem["attributes"] = [],
): SeoCollectionItem => ({ name, url, description, type, attributes });

const definedAttributes = (
    attributes: Array<{ name: string; value: string | number | boolean | null | undefined }>,
): SeoCollectionItem["attributes"] =>
    attributes.filter(
        (attribute): attribute is { name: string; value: string | number | boolean } =>
            attribute.value !== null && attribute.value !== undefined && attribute.value !== "",
    );

const buildCollectionItems = (route: CollectionRoute, data: CollectionQueryData): SeoCollectionItem[] => {
    switch (route) {
        case "/companies":
            return (
                (data as ListCompaniesQuery).Companies?.docs.map((company) =>
                    toCollectionItem(
                        company.name ?? "Company",
                        buildDetailUrl("/companies", company.id, company.serverURL),
                        company.description,
                        "Organization",
                        definedAttributes([
                            { name: "identity", value: company.identity?.name },
                            { name: "verification", value: company.verification },
                        ]),
                    ),
                ) ?? []
            );
        case "/tribes":
            return (
                (data as ListIdentitiesQuery).Identities?.docs.map((identity) =>
                    toCollectionItem(
                        identity.name,
                        buildDetailUrl("/tribes", identity.id, identity.serverURL),
                        identity.description,
                        "Organization",
                        definedAttributes([{ name: "listedItems", value: identity.itemCount }]),
                    ),
                ) ?? []
            );
        case "/jobs":
            return (
                (data as ListJobsQuery).Jobs?.docs.map((job) =>
                    toCollectionItem(
                        job.title ?? "Job",
                        buildDetailUrl("/jobs", job.id, job.serverURL),
                        job.description,
                        "JobPosting",
                        definedAttributes([
                            { name: "location", value: job.location },
                            { name: "employmentType", value: job.employmentType },
                            { name: "company", value: job.company?.name },
                            { name: "identity", value: job.company?.identity?.name },
                        ]),
                    ),
                ) ?? []
            );
        case "/products-services":
            return (
                (data as ListProductsQuery).Products?.docs.map((product) =>
                    toCollectionItem(
                        product.name ?? "Product or service",
                        buildDetailUrl("/products-services", product.id, product.serverURL),
                        product.description,
                        "Product",
                        definedAttributes([
                            { name: "company", value: product.company?.name },
                            { name: "orderable", value: product.orderable },
                            { name: "priceInUSD", value: product.priceInUSD },
                            { name: "priceInETH", value: product.priceInETH },
                            { name: "priceInTRX", value: product.priceInTRX },
                        ]),
                    ),
                ) ?? []
            );
        case "/ventures":
            return (
                (data as ListStartupsQuery).Startups?.docs.map((venture) =>
                    toCollectionItem(
                        venture.title ?? "Venture",
                        buildDetailUrl("/ventures", venture.id, venture.serverURL),
                        venture.description,
                        "Organization",
                        definedAttributes([
                            { name: "stage", value: venture.stage },
                            { name: "company", value: venture.company?.name },
                            { name: "identity", value: venture.identity?.name },
                            { name: "fundingAmount", value: venture.fundsNeeded?.amount },
                            { name: "fundingCurrency", value: venture.fundsNeeded?.currency },
                        ]),
                    ),
                ) ?? []
            );
        case "/posts":
            return (
                (data as ListPostsQuery).Posts?.docs.map((post) =>
                    toCollectionItem(
                        post.title ?? "Post",
                        buildDetailUrl("/posts", post.id, post.company?.serverURL),
                        post.meta?.description ?? post.content,
                        "Article",
                        definedAttributes([{ name: "company", value: post.company?.name }]),
                    ),
                ) ?? []
            );
    }
};

const collectionQuery = (route: CollectionRoute): string => {
    switch (route) {
        case "/companies":
            return ListCompaniesDocument;
        case "/tribes":
            return ListIdentitiesDocument;
        case "/jobs":
            return ListJobsDocument;
        case "/products-services":
            return ListProductsDocument;
        case "/ventures":
            return ListStartupsDocument;
        case "/posts":
            return ListPostsDocument;
    }
};

const collectionData = async (route: CollectionRoute, variables: CollectionVariables): Promise<CollectionQueryData> => {
    switch (route) {
        case "/companies":
            return fetchCollection<ListCompaniesQuery>(collectionQuery(route), variables);
        case "/tribes":
            return fetchCollection<ListIdentitiesQuery>(collectionQuery(route), variables);
        case "/jobs":
            return fetchCollection<ListJobsQuery>(collectionQuery(route), variables);
        case "/products-services":
            return fetchCollection<ListProductsQuery>(collectionQuery(route), variables);
        case "/ventures":
            return fetchCollection<ListStartupsQuery>(collectionQuery(route), variables);
        case "/posts":
            return fetchCollection<ListPostsQuery>(collectionQuery(route), variables);
    }
};

export const fetchCollectionPageMetadata = async (
    route: CollectionRoute,
    canonicalPath: string,
    page: number,
): Promise<{
    title: string;
    description: string;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
    extraMetaTags: Array<{ name?: string; property?: string; content: string }>;
    extraLinks: Array<{ href: string; rel: string }>;
}> => {
    const variables = { page, limit: 20, sort: "-contentRankScore" };
    const data = await collectionData(route, variables);
    const result = (() => {
        switch (route) {
            case "/companies":
                return (data as ListCompaniesQuery).Companies;
            case "/tribes":
                return (data as ListIdentitiesQuery).Identities;
            case "/jobs":
                return (data as ListJobsQuery).Jobs;
            case "/products-services":
                return (data as ListProductsQuery).Products;
            case "/ventures":
                return (data as ListStartupsQuery).Startups;
            case "/posts":
                return (data as ListPostsQuery).Posts;
        }
    })();
    const seo = SEO_BY_ROUTE[route];
    const pageData: SeoCollectionPageData = {
        items: buildCollectionItems(route, data),
        page,
        totalItems: result?.totalDocs ?? 0,
        totalPages: result?.totalPages ?? page,
        hasNextPage: result?.hasNextPage ?? false,
    };
    const title = page > 1 ? `${seo.title} - Page ${page}` : seo.title;
    const description = page > 1 ? `${seo.description} This is page ${page} of the listing.` : seo.description;

    return {
        title,
        description,
        canonicalPath,
        jsonLd: seo.buildJsonLd?.(canonicalPath, page, pageData) ?? [],
        extraMetaTags: seo.keywords?.length ? [{ name: "keywords", content: seo.keywords.join(", ") }] : [],
        extraLinks: [
            ...(page > 1 ? [{ rel: "prev", href: `${canonicalPath.split("?")[0]}?page=${page - 1}` }] : []),
            ...(pageData.hasNextPage ? [{ rel: "next", href: `${canonicalPath.split("?")[0]}?page=${page + 1}` }] : []),
        ],
    };
};
