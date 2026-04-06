import type { GraphQLResolveInfo } from "graphql";

import {
    activeFixtures,
    cloneValue,
    createNode,
    mergeInto,
    nextNodeId,
    notificationSubscriptions,
    nowIso,
    removeNode,
    searchNode,
    updateNode,
} from "./runtimeState";
import { searchResponseFor } from "./responseHelpers";
import {
    normalizeCartData,
    normalizeCommentData,
    normalizeCompanyData,
    normalizeJobData,
    normalizeOrderData,
    normalizeProductData,
    normalizeStartupData,
    normalizeUserData,
} from "./normalizers";
import type { MockCollection, MockNode } from "./types";

const matchesSearch = (value: string | undefined, term: string | undefined): boolean => {
    if (!term) {
        return true;
    }

    return String(value || "").toLowerCase().includes(term.toLowerCase());
};

const resolveCollection = (items: MockNode[], args: { page?: number; limit?: number }): MockCollection => {
    return {
        docs: items.slice(0, args.limit || items.length),
        totalDocs: items.length,
        limit: args.limit || items.length,
        totalPages: 1,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
    };
};

export const queryResolvers = {
    Carts: (_parent: unknown, args: { limit?: number; where?: { secret?: { equals?: string } } }, _context: unknown, info: GraphQLResolveInfo): MockCollection => {
        const carts = activeFixtures.carts;
        const filtered = args.where?.secret?.equals ? carts.filter((item) => item.secret === args.where?.secret?.equals) : carts;
        return info.operation.name?.value === "CartBySecret" ? resolveCollection(filtered, { limit: 1 }) : resolveCollection(filtered, args);
    },
    Searches: (_parent: unknown, _args: { limit?: number }, _context: unknown, info: GraphQLResolveInfo): MockCollection => {
        return searchResponseFor(info.operation.name?.value, { query: "", variables: { searchTerm: undefined } });
    },
    Companies: (_parent: unknown, args: { limit?: number; searchTerm?: string }): MockCollection => {
        const filtered = args.searchTerm ? activeFixtures.companies.filter((company) => matchesSearch(company.name, args.searchTerm) || matchesSearch(company.description, args.searchTerm)) : activeFixtures.companies;
        return resolveCollection(filtered, args);
    },
    Jobs: (_parent: unknown, args: { limit?: number; searchTerm?: string }): MockCollection => {
        const filtered = args.searchTerm ? activeFixtures.jobs.filter((job) => matchesSearch(job.title, args.searchTerm) || matchesSearch(job.description, args.searchTerm)) : activeFixtures.jobs;
        return resolveCollection(filtered, args);
    },
    Products: (_parent: unknown, args: { limit?: number; searchTerm?: string }): MockCollection => {
        const filtered = args.searchTerm ? activeFixtures.products.filter((product) => matchesSearch(product.name, args.searchTerm) || matchesSearch(product.description, args.searchTerm)) : activeFixtures.products;
        return resolveCollection(filtered, args);
    },
    Startups: (_parent: unknown, args: { limit?: number; searchTerm?: string }): MockCollection => {
        const filtered = args.searchTerm ? activeFixtures.startups.filter((startup) => matchesSearch(startup.title, args.searchTerm) || matchesSearch(startup.description, args.searchTerm)) : activeFixtures.startups;
        return resolveCollection(filtered, args);
    },
    Identities: (_parent: unknown, args: { limit?: number; searchTerm?: string }): MockCollection => {
        const filtered = args.searchTerm ? activeFixtures.identities.filter((identity) => matchesSearch(identity.name, args.searchTerm) || matchesSearch(identity.description, args.searchTerm)) : activeFixtures.identities;
        return resolveCollection(filtered, args);
    },
    Comments: (_parent: unknown, args: { limit?: number; where?: { replyPostRelationTo?: { equals?: string }; replyPostValue?: { equals?: string }; replyComment?: { equals?: string } } }): MockCollection => {
        const filtered = activeFixtures.comments.filter((comment) => {
            if (args.where?.replyComment?.equals) {
                return comment.replyComment?.id === args.where.replyComment.equals;
            }
            if (args.where?.replyPostRelationTo?.equals && args.where.replyPostValue?.equals) {
                return comment.replyPostRelationTo === args.where.replyPostRelationTo.equals && comment.replyPostValue === args.where.replyPostValue.equals;
            }
            return true;
        });
        return resolveCollection(filtered, args);
    },
    Syndications: (_parent: unknown, args: { limit?: number }): MockCollection => resolveCollection(activeFixtures.syndications, args),
    Company: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.companies.find((item) => item.id === args.id) || activeFixtures.companies[0],
    Job: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.jobs.find((item) => item.id === args.id) || activeFixtures.jobs[0],
    Product: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.products.find((item) => item.id === args.id) || activeFixtures.products[0],
    Startup: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.startups.find((item) => item.id === args.id) || activeFixtures.startups[0],
    Identity: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.identities.find((item) => item.id === args.id) || activeFixtures.identities[0],
    meUser: (): MockNode => activeFixtures.meUser,
};

export const mutationResolvers = {
    createCart: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCartData(data);
        if (data.status === undefined) {
            data.status = "pending";
        }

        return createNode(activeFixtures.carts, "cart", data);
    },
    deleteCart: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.carts, args.id),
    updateCart: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCartData(data);
        return updateNode(activeFixtures.carts, args.id, data, "cart");
    },
    createCompany: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCompanyData(data);
        if (data.serverURL === undefined) {
            data.serverURL = activeFixtures.companies[0]?.serverURL;
        }

        return createNode(activeFixtures.companies, "company", data);
    },
    deleteCompany: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.companies, args.id),
    updateCompany: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCompanyData(data);
        return updateNode(activeFixtures.companies, args.id, data, "company");
    },
    createJob: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeJobData(data);
        if (data.serverURL === undefined) {
            data.serverURL = activeFixtures.jobs[0]?.serverURL;
        }
        if (data.status === undefined) {
            data.status = "published";
        }

        return createNode(activeFixtures.jobs, "job", data, args.draft ? "draft" : "published");
    },
    deleteJob: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.jobs, args.id),
    updateJob: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeJobData(data);
        return updateNode(activeFixtures.jobs, args.id, data, "job");
    },
    createProduct: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeProductData(data);
        if (data.serverURL === undefined) {
            data.serverURL = activeFixtures.products[0]?.serverURL;
        }
        if (data.status === undefined) {
            data.status = "published";
        }

        return createNode(activeFixtures.products, "product", data, args.draft ? "draft" : "published");
    },
    deleteProduct: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.products, args.id),
    updateProduct: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeProductData(data);
        return updateNode(activeFixtures.products, args.id, data, "product");
    },
    createStartup: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeStartupData(data);
        if (data.serverURL === undefined) {
            data.serverURL = activeFixtures.startups[0]?.serverURL;
        }
        if (data.status === undefined) {
            data.status = "published";
        }

        return createNode(activeFixtures.startups, "startup", data, args.draft ? "draft" : "published");
    },
    deleteStartup: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.startups, args.id),
    updateStartup: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeStartupData(data);
        return updateNode(activeFixtures.startups, args.id, data, "startup");
    },
    createOrder: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeOrderData(data);
        if (data.status === undefined) {
            data.status = "awaiting-payment";
        }

        const order = createNode(activeFixtures.orders, "order", data);
        const orderWithCustomerEmail = order as MockNode & { customerEmail?: string };
        if (orderWithCustomerEmail.customerEmail === undefined && order.customer?.email !== undefined) {
            orderWithCustomerEmail.customerEmail = order.customer.email;
        }
        return order;
    },
    updateOrder: (_parent: unknown, args: { id?: string; orderId?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeOrderData(data);
        return updateNode(activeFixtures.orders, args.id ?? args.orderId, data, "order");
    },
    createComment: (_parent: unknown, args: { data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCommentData(data);
        if (data.createdBy === undefined) {
            data.createdBy = cloneValue(activeFixtures.meUser.user);
        }
        if (data.anonymousHash === undefined) {
            data.anonymousHash = `anon-${nextNodeId("comment")}`;
        }

        return createNode(activeFixtures.comments, "comment", data);
    },
    deleteComment: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.comments, args.id),
    updateComment: (_parent: unknown, args: { id?: string; content?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        if (args.content !== undefined) {
            data.content = args.content;
        }
        normalizeCommentData(data);
        return updateNode(activeFixtures.comments, args.id, data, "comment");
    },
    updateCommentContent: (_parent: unknown, args: { id?: string; content?: string }): MockNode => {
        const data = cloneValue({ content: args.content });
        return updateNode(activeFixtures.comments, args.id, data, "comment");
    },
    createNotificationSubscription: (
        _parent: unknown,
        args: { data?: { email?: string; targetCollection?: string; targetID?: string } },
    ): MockNode => {
        const data = cloneValue(args.data ?? {});
        const subscription = searchNode({
            id: nextNodeId("subscription"),
            email: data.email,
            targetCollection: data.targetCollection,
            targetID: data.targetID,
        });

        notificationSubscriptions.unshift(subscription);
        return subscription;
    },
    deleteNotificationSubscription: (_parent: unknown, args: { id?: string }): MockNode => {
        return removeNode(notificationSubscriptions, args.id);
    },
    joinStartup: (_parent: unknown, args: { id?: string }): MockNode => {
        const startup = activeFixtures.startups.find((item) => item.id === args.id);
        const member = activeFixtures.meUser.user ? cloneValue(activeFixtures.meUser.user) : undefined;

        if (startup && member) {
            const involvedUsers = Array.isArray(startup.involvedUsers) ? startup.involvedUsers : [];
            if (!involvedUsers.some((user) => user?.id === member.id)) {
                involvedUsers.unshift(member);
            }
            startup.involvedUsers = involvedUsers;
        }

        return searchNode({
            message: "Joined",
            startup: startup ? cloneValue(startup) : searchNode({ id: args.id }),
        });
    },
    leaveStartup: (_parent: unknown, args: { id?: string }): MockNode => {
        const startup = activeFixtures.startups.find((item) => item.id === args.id);
        const memberId = activeFixtures.meUser.user?.id;

        if (startup) {
            const involvedUsers = Array.isArray(startup.involvedUsers) ? startup.involvedUsers : [];
            startup.involvedUsers = involvedUsers.filter((user) => user?.id !== memberId);
        }

        return searchNode({
            message: "Left",
            startup: startup ? cloneValue(startup) : searchNode({ id: args.id }),
        });
    },
    updateUser: (_parent: unknown, args: { id?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeUserData(data);
        const user = activeFixtures.meUser.user;
        if (user && user.id === args.id) {
            mergeInto(user, data);
            user.updatedAt = nowIso();
            return user;
        }

        const updated = searchNode({
            id: args.id,
        });
        mergeInto(updated, data);
        return updated;
    },
    trackAnalyticsEvent: (): MockNode => ({
        success: true,
        analytics: { distinctId: "distinct-mock", eventId: "event-mock", sessionId: "session-mock" },
    }),
};
