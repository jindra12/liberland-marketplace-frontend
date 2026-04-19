import { mainFixtures } from "./fixtures";
import { coopFixtures } from "./coopFixtures";
import { guestFixtures } from "./guestFixtures";
import type { MockCollection, MockNode } from "./types";
import type { GraphQLFixtureBundle as FixtureGraphQLFixtureBundle } from "./fixtures/types";

export type GraphQLRequestBody = {
    operationName?: string;
    variables?: {
        searchTerm?: string;
        limit?: number;
        page?: number;
    };
    query?: string;
};

export const nowIso = (): string => new Date().toISOString();

export const cloneFixtureBundle = (bundle: FixtureGraphQLFixtureBundle): FixtureGraphQLFixtureBundle => structuredClone(bundle);

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const cloneValue = <T>(value: T): T => structuredClone(value);

export const searchNode = (value: Record<string, unknown>): MockNode => {
    return value as MockNode;
};

export const collection = (docs: MockNode[]): MockCollection => ({
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

export const byId = (items: MockNode[], id?: string): MockNode => items.find((item) => item.id === id) || items[0];

const mergeIntoImpl = (target: Record<string, unknown>, source: Record<string, unknown>) => {
    Object.entries(source).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            target[key] = value.map((entry) => cloneValue(entry));
            return;
        }

        if (isPlainObject(value) && isPlainObject(target[key])) {
            mergeIntoImpl(target[key], value);
            return;
        }

        target[key] = cloneValue(value);
    });
};

let mainFixturesState = cloneFixtureBundle(mainFixtures);
let coopFixturesState = cloneFixtureBundle(coopFixtures);
let guestFixturesState = cloneFixtureBundle(guestFixtures);

export let activeFixtures = mainFixturesState;
export const notificationSubscriptions: MockNode[] = [];

let nextIds = {
    cart: 1,
    comment: 1,
    company: 1,
    job: 1,
    post: 1,
    order: 1,
    product: 1,
    startup: 1,
    subscription: 1,
};

const resetIdCounters = () => {
    nextIds = {
        cart: 1,
        comment: 1,
        company: 1,
        job: 1,
        post: 1,
        order: 1,
        product: 1,
        startup: 1,
        subscription: 1,
    };
};

export const resetGraphQLMock = (): void => {
    mainFixturesState = cloneFixtureBundle(mainFixtures);
    coopFixturesState = cloneFixtureBundle(coopFixtures);
    guestFixturesState = cloneFixtureBundle(guestFixtures);
    activeFixtures = mainFixturesState;
    notificationSubscriptions.length = 0;
    resetIdCounters();
};

export const useGraphQLFixturesForHost = (host: string): void => {
    if (host === "127.0.0.1:3011") {
        activeFixtures = coopFixturesState;
        return;
    }

    if (host === "127.0.0.1:3012") {
        activeFixtures = guestFixturesState;
        return;
    }

    activeFixtures = mainFixturesState;
};

export const getGraphQLFixturesForHost = (host: string) => {
    if (host === "127.0.0.1:3011") {
        return coopFixturesState;
    }

    if (host === "127.0.0.1:3012") {
        return guestFixturesState;
    }

    return mainFixturesState;
};

export const nextNodeId = (prefix: keyof typeof nextIds): string => {
    const value = nextIds[prefix];
    nextIds[prefix] = value + 1;
    return `${prefix}-${value}`;
};

export const mergeInto = (target: Record<string, unknown>, source: Record<string, unknown>) => {
    mergeIntoImpl(target, source);
};

export const updateNode = (
    items: MockNode[],
    id: string | undefined,
    updates: Record<string, unknown>,
    prefix: keyof typeof nextIds,
): MockNode => {
    const target = items.find((item) => item.id === id);
    if (!target) {
        const created = searchNode({ id: id ?? nextNodeId(prefix) });
        items.unshift(created);
        mergeInto(created, updates);
        created.updatedAt = nowIso();
        return created;
    }

    mergeInto(target, updates);
    target.updatedAt = nowIso();
    return target;
};

export const removeNode = (items: MockNode[], id: string | undefined): MockNode => {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) {
        return searchNode({ id });
    }

    const [removed] = items.splice(index, 1);
    return removed;
};

export const createNode = (
    items: MockNode[],
    prefix: keyof typeof nextIds,
    data: Record<string, unknown>,
    defaultStatus?: string,
): MockNode => {
    const node = searchNode({
        id: typeof data.id === "string" ? data.id : nextNodeId(prefix),
    });
    mergeInto(node, data);
    if (defaultStatus !== undefined && node._status === undefined && node.status === undefined) {
        node._status = defaultStatus;
    }
    if (node.createdAt === undefined) {
        node.createdAt = nowIso();
    }
    if (node.updatedAt === undefined) {
        node.updatedAt = node.createdAt;
    }
    items.unshift(node);
    return node;
};
