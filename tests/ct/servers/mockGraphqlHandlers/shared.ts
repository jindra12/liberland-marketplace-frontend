import type { GraphqlVariables, JsonValue, MockCompany, MockScenarioState, MockUser } from "../types";

type MockCollectionName = "carts" | "comments" | "companies" | "identities" | "jobs" | "notificationSubscriptions" | "orders" | "products" | "startups" | "users";

export const toArray = <T>(value: T | T[] | null | undefined): T[] => {
    return Array.isArray(value) ? value : [];
};

export const toLowerText = (value: JsonValue | undefined): string => {
    return String(value ?? "").toLowerCase();
};

export const includesText = (value: JsonValue | undefined, searchTerm: JsonValue | undefined): boolean => {
    return toLowerText(value).includes(toLowerText(searchTerm));
};

export const normalizeChain = (value: JsonValue | undefined): "ethereum" | "solana" | "tron" | null => {
    const lower = toLowerText(value);

    if (lower === "ethereum" || lower === "solana" || lower === "tron") {
        return lower;
    }

    return null;
};

export const normalizeRelationId = (value: JsonValue | undefined): string | null => {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (typeof value === "object" && value !== null) {
        if ("id" in value && typeof value.id === "string") {
            return value.id;
        }

        if ("value" in value && typeof value.value === "string") {
            return value.value;
        }
    }

    return null;
};

export const normalizeRelationIds = (value: JsonValue | undefined): string[] => {
    return toArray(value).reduce<string[]>((ids, entry) => {
        const id = normalizeRelationId(entry);
        return id ? [...ids, id] : ids;
    }, []);
};

export const findRecord = <T extends { id: string }>(
    state: MockScenarioState,
    collection: MockCollectionName,
    id: string,
): T | undefined => {
    return toArray(state[collection] as Array<{ id: string }>).find((entry): entry is T => {
        return entry.id === id;
    });
};

export const getActiveUser = (state: MockScenarioState): MockUser | undefined => {
    return state.activeUserId ? findRecord<MockUser>(state, "users", state.activeUserId) : undefined;
};

export const toJsonObject = (value: JsonValue | undefined): GraphqlVariables => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return value as GraphqlVariables;
    }

    return {};
};

export const allocateId = (state: MockScenarioState, key: keyof MockScenarioState["sequences"], prefix: string): string => {
    const nextValue = state.sequences[key] ?? 1;
    state.sequences[key] = nextValue + 1;
    return `${prefix}-${nextValue}`;
};

export const toUploadedImage = (image: JsonValue | undefined, prefix: string) => {
    if (!image) {
        return null;
    }

    if (typeof image === "object" && image !== null && "url" in image) {
        return image;
    }

    const imageId = normalizeRelationId(image) ?? prefix;

    return {
        id: imageId,
        url: `https://cdn.mock.local/${prefix}/${imageId}.png`,
        alt: imageId,
        filename: `${imageId}.png`,
        width: 1200,
        height: 1200,
        mimeType: "image/png",
    };
};

export const getCompanyIdentityId = (state: MockScenarioState, companyId?: string | null): string | null => {
    const company = companyId ? findRecord<MockCompany & { identity?: string | null }>(state, "companies", companyId) : undefined;
    return company?.identity ?? null;
};

export const isSubscribed = (state: MockScenarioState, targetCollection: string, targetID: string): boolean => {
    const activeUser = getActiveUser(state);

    if (!activeUser?.email) {
        return false;
    }

    return toArray(state.notificationSubscriptions).some((subscription) => {
        return (
            subscription.email === activeUser.email &&
            subscription.targetCollection === targetCollection &&
            subscription.targetID === targetID
        );
    });
};

export const sortByField = <T extends Record<string, JsonValue | undefined>>(items: T[], sortValue?: JsonValue): T[] => {
    if (!sortValue) {
        return items;
    }

    const descending = String(sortValue).startsWith("-");
    const field = descending ? String(sortValue).slice(1) : String(sortValue);

    return [...items].sort((left, right) => {
        const leftValue = left[field] ?? "";
        const rightValue = right[field] ?? "";

        if (leftValue === rightValue) {
            return 0;
        }

        if (leftValue > rightValue) {
            return descending ? -1 : 1;
        }

        return descending ? 1 : -1;
    });
};

export const toPage = <T>(
    docs: T[],
    variables: GraphqlVariables = {},
    shortPage = false,
): {
    docs: T[];
    hasNextPage: boolean;
    hasPrevPage?: boolean;
    limit?: number;
    nextPage: number | null;
    page?: number;
    prevPage?: number | null;
    totalDocs: number;
    totalPages?: number;
} => {
    const page = Math.max(1, Number(variables.page ?? 1));
    const rawLimit = Number(variables.limit ?? docs.length ?? 1);
    const limit = rawLimit <= 0 ? docs.length || 1 : rawLimit;
    const totalDocs = docs.length;
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(totalDocs / limit)) : 1;
    const startIndex = (page - 1) * limit;
    const pageDocs = docs.slice(startIndex, startIndex + limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const base = {
        docs: pageDocs,
        totalDocs,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
    };

    if (shortPage) {
        return base;
    }

    return {
        ...base,
        limit,
        totalPages,
        page,
        hasPrevPage,
        prevPage: hasPrevPage ? page - 1 : null,
    };
};

export const ensureEntityExists = <T>(record: T | undefined, typeName: string) => {
    if (!record) {
        return {
            errors: [{ message: `${typeName} was not found` }],
        };
    }

    return null;
};

export const listPublished = <T extends { _status?: string }>(records: T[], draft: boolean) => {
    return toArray(records).filter((record) => {
        return draft === true || record._status === undefined || record._status === "published";
    });
};
