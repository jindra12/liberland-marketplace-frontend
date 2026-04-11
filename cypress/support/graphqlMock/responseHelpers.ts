import { activeFixtures, cloneValue, searchNode } from "./runtimeState";
import type { GraphQLRequestBody } from "./runtimeState";
import type { MockCollection, MockNode } from "./types";

const includes = (value: string | undefined, term: string | undefined): boolean => {
    if (!term) {
        return true;
    }

    return String(value || "").toLowerCase().includes(term.toLowerCase());
};

const getSearchTerm = (body: GraphQLRequestBody): string | undefined => body.variables?.searchTerm;

export const createImageRef = (id: string): MockNode =>
    searchNode({
        id,
        url: `/images/${id}.png`,
        alt: id,
        filename: `${id}.png`,
        mimeType: "image/png",
        width: 1200,
        height: 800,
    });

export const createNodeRef = (id: string): MockNode => searchNode({ id });

export const createIdentityRef = (identityId: string | undefined): MockNode | null => {
    if (!identityId) {
        return null;
    }

    const identity = activeFixtures.identities.find((item) => item.id === identityId);
    return identity ? cloneValue(identity) : createNodeRef(identityId);
};

export const createUserRef = (userId: string | undefined): MockNode | null => {
    if (!userId) {
        return null;
    }

    if (activeFixtures.meUser.user?.id === userId) {
        return cloneValue(activeFixtures.meUser.user);
    }

    const identity = activeFixtures.identities.find((item) => item.id === userId);
    if (identity) {
        return searchNode({
            id: identity.id,
            name: identity.name,
            email: identity.email,
        });
    }

    return createNodeRef(userId);
};

export const createCompanyRef = (companyId: string | undefined): MockNode | null => {
    if (!companyId) {
        return null;
    }

    const company = activeFixtures.companies.find((item) => item.id === companyId);
    return company ? cloneValue(company) : createNodeRef(companyId);
};

export const createProductRef = (productId: string | undefined): MockNode | null => {
    if (!productId) {
        return null;
    }

    const product = activeFixtures.products.find((item) => item.id === productId);
    return product ? cloneValue(product) : createNodeRef(productId);
};

export const createVariantRef = (variantId: string | undefined): MockNode | null => {
    if (!variantId) {
        return null;
    }

    const variant = activeFixtures.products
        .flatMap((product) => product.variants?.docs ?? [])
        .find((item) => item.id === variantId);
    return variant ? cloneValue(variant) : createNodeRef(variantId);
};

export const createTransactionRef = (transactionId: string | undefined): MockNode | null => {
    if (!transactionId) {
        return null;
    }

    return createNodeRef(transactionId);
};

export const createCryptoPriceNode = (value: Record<string, unknown> | undefined, prefix: string, index: number): MockNode =>
    searchNode({
        id: typeof value?.id === "string" ? value.id : `${prefix}-crypto-price-${index + 1}`,
        chain: value?.chain,
        stablePerNative: value?.stablePerNative,
        nativePerStable: value?.nativePerStable,
        expectedNativeAmount: value?.expectedNativeAmount,
        fetchedAt: value?.fetchedAt,
    });

export const createTransactionHashNode = (value: Record<string, unknown> | undefined, prefix: string, index: number): MockNode =>
    searchNode({
        id: typeof value?.id === "string" ? value.id : `${prefix}-transaction-hash-${index + 1}`,
        chain: value?.chain,
        transactionHash: value?.transactionHash,
        product: createProductRef(typeof value?.product === "string" ? value.product : undefined),
    });

const buildSearchCollection = (docs: MockNode[]): MockCollection => ({
    docs,
    totalDocs: docs.length,
    limit: docs.length,
    totalPages: 1,
    page: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
});

const buildSearchDoc = (relationTo: string, value: MockNode, index: number): MockNode =>
    searchNode({
        id: `search-${relationTo}-${value.id || index}`,
        title: value.title || value.name,
        priority: 100 - index,
        doc: searchNode({
            relationTo,
            value,
        }),
    });

export const searchResponseFor = (operationName: string | undefined, body: GraphQLRequestBody): MockCollection => {
    const term = getSearchTerm(body);

    if (operationName === "SearchJobs" || operationName === "SearchJobsByCompany" || operationName === "SearchJobsBySecondaryIdentity") {
        return buildSearchCollection(
            activeFixtures.jobs.filter((job) => includes(job.title, term) || includes(job.description, term)).map((job, index) => buildSearchDoc("jobs", job, index)),
        );
    }

    if (
        operationName === "SearchCompanies" ||
        operationName === "SearchCompaniesByIdentity" ||
        operationName === "SearchCompaniesBySecondaryIdentity"
    ) {
        return buildSearchCollection(
            activeFixtures.companies.filter((company) => includes(company.name, term) || includes(company.description, term)).map((company, index) => buildSearchDoc("companies", company, index)),
        );
    }

    if (
        operationName === "SearchProducts" ||
        operationName === "SearchProductsByCompany" ||
        operationName === "SearchProductsByIdentity"
    ) {
        return buildSearchCollection(
            activeFixtures.products.filter((product) => includes(product.name, term) || includes(product.description, term)).map((product, index) => buildSearchDoc("products", product, index)),
        );
    }

    if (operationName === "SearchIdentities") {
        return buildSearchCollection(
            activeFixtures.identities.filter((identity) => includes(identity.name, term) || includes(identity.description, term)).map((identity, index) => buildSearchDoc("identities", identity, index)),
        );
    }

    if (operationName === "SearchStartups") {
        return buildSearchCollection(
            activeFixtures.startups.filter((startup) => includes(startup.title, term) || includes(startup.description, term)).map((startup, index) => buildSearchDoc("startups", startup, index)),
        );
    }

    return buildSearchCollection([]);
};
