import {
    ListCompaniesQuery,
    ListIdentitiesQuery,
    ListJobsQuery,
    ListProductsQuery,
    ListStartupsQuery,
    SearchCompaniesQuery,
    SearchIdentitiesQuery,
    SearchJobsQuery,
    SearchProductsQuery,
    SearchStartupsQuery,
} from "../../generated/graphql";

type JobDoc = NonNullable<NonNullable<ListJobsQuery["Jobs"]>["docs"]>[number];
type SearchJobDoc = NonNullable<NonNullable<NonNullable<SearchJobsQuery["Searches"]>["docs"]>[number]>;

type CompanyDoc = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];
type SearchCompanyDoc = NonNullable<NonNullable<NonNullable<SearchCompaniesQuery["Searches"]>["docs"]>[number]>;

type ProductDoc = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type SearchProductDoc = NonNullable<NonNullable<NonNullable<SearchProductsQuery["Searches"]>["docs"]>[number]>;

type StartupDoc = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];
type SearchStartupDoc = NonNullable<NonNullable<NonNullable<SearchStartupsQuery["Searches"]>["docs"]>[number]>;

type IdentityDoc = NonNullable<NonNullable<ListIdentitiesQuery["Identities"]>["docs"]>[number];
type SearchIdentityDoc = NonNullable<NonNullable<NonNullable<SearchIdentitiesQuery["Searches"]>["docs"]>[number]>;

const mapSearchDocs = <TDoc, TSearchDoc extends { doc?: { relationTo?: string | null; value?: TDoc | null } | null }>(
    docs: TSearchDoc[] | undefined,
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

        return [doc];
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
