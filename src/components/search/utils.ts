import {
    ListCompaniesQuery,
    ListIdentitiesQuery,
    ListJobsQuery,
    ListPostsQuery,
    ListProductsQuery,
    ListStartupsQuery,
    SearchCompaniesQuery,
    SearchIdentitiesQuery,
    SearchJobsQuery,
    SearchPostsQuery,
    SearchProductsQuery,
    SearchStartupsQuery,
} from "../../generated/graphql";

type JobDoc = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];
type SearchJobDoc = NonNullable<NonNullable<NonNullable<SearchJobsQuery["Searches"]>["docs"]>[number]>;
type PostDoc = NonNullable<NonNullable<ListPostsQuery["Posts"]>["docs"]>[number];
type SearchPostDoc = NonNullable<NonNullable<NonNullable<SearchPostsQuery["Searches"]>["docs"]>[number]>;

type CompanyDoc = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];
type SearchCompanyDoc = NonNullable<NonNullable<NonNullable<SearchCompaniesQuery["Searches"]>["docs"]>[number]>;

type ProductDoc = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type SearchProductDoc = NonNullable<NonNullable<NonNullable<SearchProductsQuery["Searches"]>["docs"]>[number]>;

type StartupDoc = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];
type SearchStartupDoc = NonNullable<NonNullable<NonNullable<SearchStartupsQuery["Searches"]>["docs"]>[number]>;

type IdentityDoc = NonNullable<NonNullable<ListIdentitiesQuery["Identities"]>["docs"]>[number];
type SearchIdentityDoc = NonNullable<NonNullable<NonNullable<SearchIdentitiesQuery["Searches"]>["docs"]>[number]>;

const mapSearchDocs = <TDoc>(
    docs: Array<{ doc?: { relationTo?: string | null; value?: Record<string, unknown> | null } | null }> | undefined,
    relationTo: string,
): TDoc[] => {
    return (docs ?? []).flatMap((searchDoc) => {
        if (searchDoc.doc?.relationTo !== relationTo) {
            return [];
        }

        const doc = searchDoc.doc.value;
        if (!doc) {
            return [];
        }

        return [doc as TDoc];
    });
};

export const mapSearchJobs = (docs: SearchJobDoc[] | undefined): JobDoc[] => mapSearchDocs(docs, "jobs");

export const mapSearchCompanies = (docs: SearchCompanyDoc[] | undefined): CompanyDoc[] =>
    mapSearchDocs(docs, "companies");

export const mapSearchProducts = (docs: SearchProductDoc[] | undefined): ProductDoc[] =>
    mapSearchDocs(docs, "products");

export const mapSearchStartups = (docs: SearchStartupDoc[] | undefined): StartupDoc[] =>
    mapSearchDocs(docs, "startups");

export const mapSearchIdentities = (docs: SearchIdentityDoc[] | undefined): IdentityDoc[] =>
    mapSearchDocs(docs, "identities");

export const mapSearchPosts = (docs: SearchPostDoc[] | undefined): PostDoc[] => mapSearchDocs(docs, "posts");
