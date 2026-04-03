import type { GraphqlOperationResult, GraphqlVariables, JsonValue, MockScenarioState } from "../types";
import { allocateId, ensureEntityExists, getActiveUser, normalizeRelationId, normalizeRelationIds, toJsonObject, toUploadedImage, toArray } from "./shared";
import { toCompany, toJob, toProduct, toStartup } from "./entities";

type CollectionName = "companies" | "jobs" | "startups" | "products";

type MockRecord = Record<string, JsonValue | undefined> & {
    id: string;
};

const buildCompanyRecord = (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => {
    const activeUser = getActiveUser(state);
    const companyId = existingRecord?.id ? String(existingRecord.id) : allocateId(state, "company", "company");

    return {
        id: companyId,
        serverURL: state.serverURL,
        name: data.name ?? existingRecord?.name ?? "Untitled company",
        _status: draft ? "draft" : data._status ?? existingRecord?._status ?? "published",
        description: data.description ?? existingRecord?.description ?? null,
        cryptoAddresses: data.cryptoAddresses ?? existingRecord?.cryptoAddresses ?? null,
        website: data.website ?? existingRecord?.website ?? null,
        phone: data.phone ?? existingRecord?.phone ?? null,
        email: data.email ?? existingRecord?.email ?? null,
        allowedIdentities:
            data.allowedIdentities !== undefined
            ? normalizeRelationIds(data.allowedIdentities)
            : (existingRecord?.allowedIdentities as string[] | undefined) ?? [],
        disallowedIdentities:
            data.disallowedIdentities !== undefined
                ? normalizeRelationIds(data.disallowedIdentities)
                : (existingRecord?.disallowedIdentities as string[] | undefined) ?? [],
        createdBy: existingRecord?.createdBy ?? activeUser?.id ?? null,
        identity:
            data.identity !== undefined ? normalizeRelationId(data.identity) : (existingRecord?.identity as string | null | undefined) ?? null,
        priority: data.priority ?? existingRecord?.priority ?? 50,
        image: data.image !== undefined ? toUploadedImage(data.image, `company-${companyId}`) : existingRecord?.image,
    };
};

const buildJobRecord = (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => {
    const activeUser = getActiveUser(state);
    const jobId = existingRecord?.id ? String(existingRecord.id) : allocateId(state, "job", "job");

    return {
        id: jobId,
        serverURL: state.serverURL,
        title: data.title ?? existingRecord?.title ?? "Untitled job",
        _status: draft ? "draft" : data._status ?? existingRecord?._status ?? "published",
        description: data.description ?? existingRecord?.description ?? null,
        location: data.location ?? existingRecord?.location ?? null,
        employmentType: data.employmentType ?? existingRecord?.employmentType ?? null,
        positions: data.positions ?? existingRecord?.positions ?? 1,
        postedAt: data.postedAt ?? existingRecord?.postedAt ?? new Date().toISOString(),
        isActive: data.isActive ?? existingRecord?.isActive ?? true,
        applyUrl: data.applyUrl ?? existingRecord?.applyUrl ?? null,
        bounty: data.bounty ?? existingRecord?.bounty ?? null,
        salaryRange: data.salaryRange ?? existingRecord?.salaryRange ?? null,
        allowedIdentities:
            data.allowedIdentities !== undefined
                ? normalizeRelationIds(data.allowedIdentities)
                : (existingRecord?.allowedIdentities as string[] | undefined) ?? [],
        disallowedIdentities:
            data.disallowedIdentities !== undefined
                ? normalizeRelationIds(data.disallowedIdentities)
                : (existingRecord?.disallowedIdentities as string[] | undefined) ?? [],
        company: data.company !== undefined ? normalizeRelationId(data.company) : (existingRecord?.company as string | null | undefined) ?? null,
        createdBy: existingRecord?.createdBy ?? activeUser?.id ?? null,
        priority: data.priority ?? existingRecord?.priority ?? 50,
        image: data.image !== undefined ? toUploadedImage(data.image, `job-${jobId}`) : existingRecord?.image,
    };
};

const buildStartupRecord = (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => {
    const activeUser = getActiveUser(state);
    const startupId = existingRecord?.id ? String(existingRecord.id) : allocateId(state, "startup", "startup");

    return {
        id: startupId,
        serverURL: state.serverURL,
        title: data.title ?? existingRecord?.title ?? "Untitled startup",
        _status: draft ? "draft" : data._status ?? existingRecord?._status ?? "published",
        description: data.description ?? existingRecord?.description ?? null,
        stage: data.stage ?? existingRecord?.stage ?? null,
        lookingFor: data.lookingFor ?? existingRecord?.lookingFor ?? null,
        alreadyHave: data.alreadyHave ?? existingRecord?.alreadyHave ?? null,
        fundsNeeded: data.fundsNeeded ?? existingRecord?.fundsNeeded ?? null,
        company: data.company !== undefined ? normalizeRelationId(data.company) : (existingRecord?.company as string | null | undefined) ?? null,
        createdBy: existingRecord?.createdBy ?? activeUser?.id ?? null,
        identity: data.identity !== undefined ? normalizeRelationId(data.identity) : (existingRecord?.identity as string | null | undefined) ?? null,
        involvedUsers:
            data.involvedUsers !== undefined
                ? normalizeRelationIds(data.involvedUsers)
                : (existingRecord?.involvedUsers as string[] | undefined) ?? [],
        priority: data.priority ?? existingRecord?.priority ?? 50,
        createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: data.image !== undefined ? toUploadedImage(data.image, `startup-${startupId}`) : existingRecord?.image,
    };
};

const buildProductRecord = (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => {
    const activeUser = getActiveUser(state);
    const productId = existingRecord?.id ? String(existingRecord.id) : allocateId(state, "product", "product");

    return {
        id: productId,
        serverURL: state.serverURL,
        name: data.name ?? existingRecord?.name ?? "Untitled product",
        _status: draft ? "draft" : data._status ?? existingRecord?._status ?? "published",
        inventory: data.inventory ?? existingRecord?.inventory ?? null,
        enableVariants: data.enableVariants ?? existingRecord?.enableVariants ?? false,
        variantTypes: data.variantTypes ?? existingRecord?.variantTypes ?? [],
        variants: data.variants ?? existingRecord?.variants ?? [],
        priceInUSDEnabled: data.priceInUSDEnabled ?? existingRecord?.priceInUSDEnabled ?? false,
        priceInUSD: data.priceInUSD ?? existingRecord?.priceInUSD ?? null,
        priceInETH: data.priceInETH ?? existingRecord?.priceInETH ?? null,
        priceInSOL: data.priceInSOL ?? existingRecord?.priceInSOL ?? null,
        priceInTRX: data.priceInTRX ?? existingRecord?.priceInTRX ?? null,
        description: data.description ?? existingRecord?.description ?? null,
        cryptoAddresses: data.cryptoAddresses ?? existingRecord?.cryptoAddresses ?? null,
        url: data.url ?? existingRecord?.url ?? null,
        orderable: data.orderable ?? existingRecord?.orderable ?? false,
        properties: data.properties ?? existingRecord?.properties ?? [],
        company: data.company !== undefined ? normalizeRelationId(data.company) : (existingRecord?.company as string | null | undefined) ?? null,
        createdBy: existingRecord?.createdBy ?? activeUser?.id ?? null,
        priority: data.priority ?? existingRecord?.priority ?? 50,
        createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: existingRecord?.deletedAt ?? null,
        image: data.image !== undefined ? toUploadedImage(data.image, `product-${productId}`) : existingRecord?.image,
    };
};

const createEntityResponse = (
    state: MockScenarioState,
    collection: CollectionName,
    builder: (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => MockRecord,
    data: GraphqlVariables,
    draft: boolean,
    rootKey: string,
) => {
    const record = builder(state, data, draft, undefined);
    state[collection] = [...toArray(state[collection]), record];
    return {
        data: {
            [rootKey]:
                collection === "companies"
                    ? toCompany(state, record as never)
                    : collection === "jobs"
                      ? toJob(state, record as never)
                      : collection === "startups"
                        ? toStartup(state, record as never)
                        : toProduct(state, record as never),
        },
    };
};

const updateEntityResponse = (
    state: MockScenarioState,
    collection: CollectionName,
    builder: (state: MockScenarioState, data: GraphqlVariables, draft: boolean, existingRecord?: MockRecord) => MockRecord,
    id: string,
    data: GraphqlVariables,
    draft: boolean,
    rootKey: string,
) => {
    const existingRecord = toArray(state[collection]).find((entry) => entry.id === id);
    const notFound = ensureEntityExists(existingRecord, rootKey);

    if (notFound) {
        return notFound;
    }

    const nextRecord = builder(state, data, draft, existingRecord as MockRecord);
    state[collection] = toArray(state[collection]).map((entry) => {
        return entry.id === id ? nextRecord : entry;
    });

    return {
        data: {
            [rootKey]:
                collection === "companies"
                    ? toCompany(state, nextRecord as never)
                    : collection === "jobs"
                      ? toJob(state, nextRecord as never)
                      : collection === "startups"
                        ? toStartup(state, nextRecord as never)
                        : toProduct(state, nextRecord as never),
        },
    };
};

const deleteEntityResponse = (state: MockScenarioState, collection: CollectionName, id: string, rootKey: string) => {
    const existingRecord = toArray(state[collection]).find((entry) => entry.id === id);
    const notFound = ensureEntityExists(existingRecord, rootKey);

    if (notFound) {
        return notFound;
    }

    state[collection] = toArray(state[collection]).filter((entry) => entry.id !== id);

    if (collection === "companies") {
        state.jobs = toArray(state.jobs).filter((entry) => entry.company !== id);
        state.startups = toArray(state.startups).filter((entry) => entry.company !== id);
        state.products = toArray(state.products).filter((entry) => entry.company !== id);
    }

    return {
        data: {
            [rootKey]: {
                id,
            },
        },
    };
};

export const handleCollectionMutations = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    const data = toJsonObject(variables.data);

    if (operationName === "CreateCompany") {
        return createEntityResponse(state, "companies", buildCompanyRecord, data, Boolean(variables.draft), "createCompany");
    }

    if (operationName === "UpdateCompany") {
        return updateEntityResponse(state, "companies", buildCompanyRecord, String(variables.id), data, Boolean(variables.draft), "updateCompany");
    }

    if (operationName === "DeleteCompany") {
        return deleteEntityResponse(state, "companies", String(variables.id), "deleteCompany");
    }

    if (operationName === "CreateJob") {
        return createEntityResponse(state, "jobs", buildJobRecord, data, Boolean(variables.draft), "createJob");
    }

    if (operationName === "UpdateJob") {
        return updateEntityResponse(state, "jobs", buildJobRecord, String(variables.id), data, Boolean(variables.draft), "updateJob");
    }

    if (operationName === "DeleteJob") {
        return deleteEntityResponse(state, "jobs", String(variables.id), "deleteJob");
    }

    if (operationName === "CreateStartup") {
        return createEntityResponse(state, "startups", buildStartupRecord, data, Boolean(variables.draft), "createStartup");
    }

    if (operationName === "UpdateStartup") {
        return updateEntityResponse(state, "startups", buildStartupRecord, String(variables.id), data, Boolean(variables.draft), "updateStartup");
    }

    if (operationName === "DeleteStartup") {
        return deleteEntityResponse(state, "startups", String(variables.id), "deleteStartup");
    }

    if (operationName === "CreateProduct") {
        return createEntityResponse(state, "products", buildProductRecord, data, Boolean(variables.draft), "createProduct");
    }

    if (operationName === "UpdateProduct") {
        return updateEntityResponse(state, "products", buildProductRecord, String(variables.id), data, Boolean(variables.draft), "updateProduct");
    }

    if (operationName === "DeleteProduct") {
        return deleteEntityResponse(state, "products", String(variables.id), "deleteProduct");
    }

    return null;
};
