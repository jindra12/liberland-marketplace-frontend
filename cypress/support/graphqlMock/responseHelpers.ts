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

export const createPostRef = (postId: string | undefined): MockNode | null => {
    if (!postId) {
        return null;
    }

    const post = activeFixtures.posts.find((item) => item.id === postId);
    return post ? cloneValue(post) : createNodeRef(postId);
};

export const createJobRef = (jobId: string | undefined): MockNode | null => {
    if (!jobId) {
        return null;
    }

    const job = activeFixtures.jobs.find((item) => item.id === jobId);
    return job ? cloneValue(job) : createNodeRef(jobId);
};

export const createStartupRef = (startupId: string | undefined): MockNode | null => {
    if (!startupId) {
        return null;
    }

    const startup = activeFixtures.startups.find((item) => item.id === startupId);
    return startup ? cloneValue(startup) : createNodeRef(startupId);
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

const buildSearchCollection = (docs: MockNode[], page: number, limit: number, totalDocs: number): MockCollection => ({
    docs,
    totalDocs,
    limit,
    totalPages: Math.max(1, Math.ceil(totalDocs / limit)),
    page,
    hasPrevPage: page > 1,
    hasNextPage: page * limit < totalDocs,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page * limit < totalDocs ? page + 1 : null,
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
    const page = body.variables?.page && body.variables.page > 0 ? body.variables.page : 1;
    const limit = body.variables?.limit && body.variables.limit > 0 ? body.variables.limit : 5;
    const searchOffset = (page - 1) * limit;

    if (operationName === "SearchJobs" || operationName === "SearchJobsByCompany" || operationName === "SearchJobsBySecondaryIdentity") {
        const filtered = activeFixtures.jobs.filter((job) => includes(job.title, term) || includes(job.description, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((job, index) => buildSearchDoc("jobs", job, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    if (
        operationName === "SearchCompanies" ||
        operationName === "SearchCompaniesByIdentity" ||
        operationName === "SearchCompaniesBySecondaryIdentity"
    ) {
        const filtered = activeFixtures.companies.filter((company) => includes(company.name, term) || includes(company.description, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((company, index) => buildSearchDoc("companies", company, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    if (
        operationName === "SearchProducts" ||
        operationName === "SearchProductsByCompany" ||
        operationName === "SearchProductsByIdentity"
    ) {
        const filtered = activeFixtures.products.filter((product) => includes(product.name, term) || includes(product.description, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((product, index) => buildSearchDoc("products", product, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    if (operationName === "SearchPosts") {
        const filtered = activeFixtures.posts.filter((post) => includes(post.title, term) || includes(post.content, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((post, index) => buildSearchDoc("posts", post, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    if (operationName === "SearchIdentities") {
        const filtered = activeFixtures.identities.filter((identity) => includes(identity.name, term) || includes(identity.description, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((identity, index) => buildSearchDoc("identities", identity, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    if (operationName === "SearchStartups") {
        const filtered = activeFixtures.startups.filter((startup) => includes(startup.title, term) || includes(startup.description, term));
        const docs = filtered
            .slice(searchOffset, searchOffset + limit)
            .map((startup, index) => buildSearchDoc("startups", startup, searchOffset + index));
        return buildSearchCollection(docs, page, limit, filtered.length);
    }

    return buildSearchCollection([], page, limit, 0);
};
