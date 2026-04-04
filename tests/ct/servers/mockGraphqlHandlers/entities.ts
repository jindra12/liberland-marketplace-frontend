import type { JsonValue, MockScenarioState } from "../types";
import {
    findRecord,
    getCompanyIdentityId,
    isSubscribed,
    normalizeRelationIds,
    toArray,
} from "./shared";

type MockWithId = {
    id: string;
    [key: string]: JsonValue | undefined;
};

type MockVariantRecord = {
    id: string;
    inventory?: number | null;
    options?: Array<{ id: string; label?: string | null; value?: string | null; variantType?: string | null }>;
    priceInUSD?: number | null;
    priceInUSDEnabled?: boolean | null;
    title?: string | null;
};

export const toCreatedBy = (state: MockScenarioState, userId?: string | null) => {
    const user = userId ? findRecord<{ id: string; email?: string | null; name?: string | null }>(state, "users", userId) : undefined;

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
    };
};

export const toIdentitySummary = (state: MockScenarioState, identityId?: string | null) => {
    const identity = identityId
        ? findRecord<MockWithId & { description?: string | null; image?: JsonValue; name?: string | null; serverURL?: string; website?: string | null }>(
              state,
              "identities",
              identityId,
          )
        : undefined;

    if (!identity) {
        return null;
    }

    return {
        id: identity.id,
        isSubscribed: isSubscribed(state, "identities", identity.id),
        serverURL: identity.serverURL ?? state.serverURL,
        name: identity.name ?? null,
        description: identity.description ?? null,
        website: identity.website ?? null,
        image: identity.image ?? null,
    };
};

export const toIdentity = (
    state: MockScenarioState,
    identity: MockWithId & { image?: JsonValue; name?: string | null; serverURL?: string; description?: string | null; website?: string | null },
) => {
    const itemCount =
        toArray(state.companies).filter((company) => company.identity === identity.id).length +
        toArray(state.jobs).filter((job) => getCompanyIdentityId(state, job.company) === identity.id).length +
        toArray(state.startups).filter((startup) => startup.identity === identity.id).length +
        toArray(state.products).filter((product) => getCompanyIdentityId(state, product.company) === identity.id).length;

    return {
        id: identity.id,
        isSubscribed: isSubscribed(state, "identities", identity.id),
        serverURL: identity.serverURL ?? state.serverURL,
        name: identity.name ?? null,
        description: identity.description ?? null,
        website: identity.website ?? null,
        itemCount,
        image: identity.image ?? null,
    };
};

export const toCompany = (
    state: MockScenarioState,
    company: MockWithId & {
        _status?: string;
        allowedIdentities?: JsonValue;
        createdBy?: string | null;
        cryptoAddresses?: JsonValue;
        description?: string | null;
        disallowedIdentities?: JsonValue;
        email?: string | null;
        identity?: string | null;
        image?: JsonValue;
        name?: string | null;
        phone?: string | null;
        serverURL?: string;
        website?: string | null;
    },
) => {
    return {
        id: company.id,
        isSubscribed: isSubscribed(state, "companies", company.id),
        serverURL: company.serverURL ?? state.serverURL,
        name: company.name ?? null,
        _status: company._status ?? "published",
        description: company.description ?? null,
        cryptoAddresses: company.cryptoAddresses ?? null,
        website: company.website ?? null,
        phone: company.phone ?? null,
        email: company.email ?? null,
        allowedIdentities: normalizeRelationIds(company.allowedIdentities).map((identityId) =>
            toIdentitySummary(state, identityId),
        ),
        disallowedIdentities: normalizeRelationIds(company.disallowedIdentities).map((identityId) =>
            toIdentitySummary(state, identityId),
        ),
        createdBy: company.createdBy ? { id: company.createdBy } : null,
        identity: toIdentitySummary(state, company.identity),
        image: company.image ?? null,
    };
};

export const toVariantType = (variantType?: { id: string; label?: string | null; name?: string | null } | null) => {
    return variantType
        ? {
              id: variantType.id,
              label: variantType.label ?? null,
              name: variantType.name ?? null,
          }
        : null;
};

export const toVariant = (
    product: { variantTypes?: Array<{ id: string }>; [key: string]: JsonValue | undefined },
    variant: MockVariantRecord,
) => {
    return {
        id: variant.id,
        title: variant.title ?? null,
        inventory: variant.inventory ?? null,
        priceInUSDEnabled: variant.priceInUSDEnabled ?? null,
        priceInUSD: variant.priceInUSD ?? null,
        options: toArray(variant.options).map((option) => {
            const variantType = toArray(product.variantTypes).find((entry) => entry.id === option.variantType);

            return {
                id: option.id,
                label: option.label ?? null,
                value: option.value ?? null,
                variantType: toVariantType(variantType),
            };
        }),
    };
};

export const toProduct = (
    state: MockScenarioState,
    product: MockWithId & {
        _status?: string;
        company?: string | null;
        createdAt?: string | null;
        createdBy?: string | null;
        cryptoAddresses?: JsonValue;
        deletedAt?: string | null;
        description?: string | null;
        enableVariants?: boolean;
        image?: JsonValue;
        inventory?: number | null;
        name?: string | null;
        orderable?: boolean | null;
        priceInETH?: string | null;
        priceInSOL?: string | null;
        priceInTRX?: string | null;
        priceInUSD?: number | null;
        priceInUSDEnabled?: boolean | null;
        priority?: number;
        properties?: Array<{ id: string; key?: string | null; value?: string | null }>;
        serverURL?: string;
        url?: string | null;
        variantTypes?: Array<{ id: string; label?: string | null; name?: string | null }>;
        variants?: Array<{
            id: string;
            inventory?: number | null;
            options?: Array<{ id: string; label?: string | null; value?: string | null; variantType?: string | null }>;
            priceInUSD?: number | null;
            priceInUSDEnabled?: boolean | null;
            title?: string | null;
        }>;
    },
) => {
    const company = product.company ? findRecord<MockWithId & { identity?: string | null }>(state, "companies", product.company) : undefined;

    return {
        __typename: "Product",
        id: product.id,
        isSubscribed: isSubscribed(state, "products", product.id),
        inventory: product.inventory ?? null,
        enableVariants: product.enableVariants ?? false,
        variantTypes: toArray(product.variantTypes).map((variantType) => toVariantType(variantType)),
        variants: {
            docs: toArray(product.variants).map((variant) => toVariant(product, variant)),
            totalDocs: toArray(product.variants).length,
            hasNextPage: false,
        },
        priceInUSDEnabled: product.priceInUSDEnabled ?? null,
        priceInUSD: product.priceInUSD ?? null,
        priceInETH: product.priceInETH ?? null,
        priceInSOL: product.priceInSOL ?? null,
        priceInTRX: product.priceInTRX ?? null,
        serverURL: product.serverURL ?? state.serverURL,
        name: product.name ?? null,
        companyIdentityId: getCompanyIdentityId(state, product.company),
        _status: product._status ?? "published",
        description: product.description ?? null,
        cryptoAddresses: product.cryptoAddresses ?? null,
        url: product.url ?? null,
        orderable: product.orderable ?? false,
        properties: toArray(product.properties).map((property) => ({
            id: property.id,
            key: property.key ?? null,
            value: property.value ?? null,
        })),
        updatedAt: product.updatedAt ?? null,
        createdAt: product.createdAt ?? null,
        deletedAt: product.deletedAt ?? null,
        company: company ? toCompany(state, company) : null,
        image: product.image ?? null,
    };
};

export const toJob = (
    state: MockScenarioState,
    job: MockWithId & {
        _status?: string;
        allowedIdentities?: JsonValue;
        applyUrl?: string | null;
        bounty?: JsonValue;
        company?: string | null;
        createdBy?: string | null;
        description?: string | null;
        disallowedIdentities?: JsonValue;
        employmentType?: string | null;
        image?: JsonValue;
        isActive?: boolean;
        location?: string | null;
        positions?: number | null;
        postedAt?: string | null;
        priority?: number;
        salaryRange?: JsonValue;
        serverURL?: string;
        title?: string | null;
    },
) => {
    const company = job.company ? findRecord<MockWithId & { identity?: string | null }>(state, "companies", job.company) : undefined;

    return {
        __typename: "Job",
        id: job.id,
        isSubscribed: isSubscribed(state, "jobs", job.id),
        serverURL: job.serverURL ?? state.serverURL,
        title: job.title ?? null,
        _status: job._status ?? "published",
        description: job.description ?? null,
        location: job.location ?? null,
        employmentType: job.employmentType ?? null,
        positions: job.positions ?? null,
        postedAt: job.postedAt ?? null,
        isActive: job.isActive ?? false,
        applyUrl: job.applyUrl ?? null,
        bounty: job.bounty ?? null,
        allowedIdentities: normalizeRelationIds(job.allowedIdentities).map((identityId) =>
            toIdentitySummary(state, identityId),
        ),
        disallowedIdentities: normalizeRelationIds(job.disallowedIdentities).map((identityId) =>
            toIdentitySummary(state, identityId),
        ),
        salaryRange: job.salaryRange ?? null,
        createdBy: job.createdBy ? { id: job.createdBy } : null,
        company: company ? toCompany(state, company) : null,
        image: job.image ?? null,
        companyIdentityId: getCompanyIdentityId(state, job.company),
    };
};

export const toStartup = (
    state: MockScenarioState,
    startup: MockWithId & {
        _status?: string;
        alreadyHave?: string[] | null;
        company?: string | null;
        createdAt?: string | null;
        createdBy?: string | null;
        description?: string | null;
        fundsNeeded?: JsonValue;
        image?: JsonValue;
        identity?: string | null;
        involvedUsers?: JsonValue;
        lookingFor?: string[] | null;
        priority?: number;
        serverURL?: string;
        stage?: string | null;
        title?: string | null;
        updatedAt?: string | null;
    },
) => {
    const company = startup.company ? findRecord<MockWithId & { identity?: string | null }>(state, "companies", startup.company) : undefined;

    return {
        __typename: "Startup",
        id: startup.id,
        isSubscribed: isSubscribed(state, "startups", startup.id),
        serverURL: startup.serverURL ?? state.serverURL,
        title: startup.title ?? null,
        _status: startup._status ?? "published",
        description: startup.description ?? null,
        stage: startup.stage ?? null,
        lookingFor: startup.lookingFor ?? null,
        alreadyHave: startup.alreadyHave ?? null,
        fundsNeeded: startup.fundsNeeded ?? null,
        company: company ? toCompany(state, company) : null,
        createdBy: startup.createdBy ? { id: startup.createdBy } : null,
        identity: toIdentitySummary(state, startup.identity),
        image: startup.image ?? null,
        involvedUsers: normalizeRelationIds(startup.involvedUsers).map((userId) => toCreatedBy(state, userId)),
        createdAt: startup.createdAt ?? null,
        updatedAt: startup.updatedAt ?? null,
    };
};

export const toComment = (
    state: MockScenarioState,
    comment: MockWithId & {
        anonymousHash?: string | null;
        content?: string | null;
        createdAt?: string | null;
        createdBy?: string | null;
        replyComment?: string | null;
        replyPostRelationTo?: string | null;
        replyPostValue?: string | null;
        updatedAt?: string | null;
    },
) => {
    return {
        id: comment.id,
        content: comment.content ?? null,
        createdBy: toCreatedBy(state, comment.createdBy),
        anonymousHash: comment.anonymousHash ?? null,
        replyPostRelationTo: comment.replyPostRelationTo ?? null,
        replyPostValue: comment.replyPostValue ?? null,
        createdAt: comment.createdAt ?? null,
        updatedAt: comment.updatedAt ?? null,
        replyComment: comment.replyComment ? { id: comment.replyComment } : null,
        replyPost: comment.replyPostRelationTo
            ? {
                  relationTo: comment.replyPostRelationTo,
              }
            : null,
    };
};

export const findVariantRecord = (
    product: { variants?: Array<MockVariantRecord> },
    variantId?: string | null,
) => {
    return toArray(product?.variants).find((variant) => variant.id === variantId);
};

export const resolveUsdPrice = (
    product:
        | {
              priceInUSD?: number | null;
              priceInUSDEnabled?: boolean | null;
              variants?: Array<MockVariantRecord>;
          }
        | undefined,
    variantId?: string | null,
) => {
    const variant = variantId ? findVariantRecord(product ?? {}, variantId) : undefined;

    if (variant?.priceInUSDEnabled && typeof variant.priceInUSD === "number") {
        return variant.priceInUSD;
    }

    if (product?.priceInUSDEnabled && typeof product.priceInUSD === "number") {
        return product.priceInUSD;
    }

    return 0;
};

export const resolveInventoryLimit = (
    product: { inventory?: number | null; variants?: Array<MockVariantRecord> } | undefined,
    variantId?: string | null,
) => {
    const variant = variantId ? findVariantRecord(product ?? {}, variantId) : undefined;

    if (typeof variant?.inventory === "number") {
        return variant.inventory;
    }

    if (typeof product?.inventory === "number") {
        return product.inventory;
    }

    return null;
};
