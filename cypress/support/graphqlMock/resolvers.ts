import type { GraphQLResolveInfo } from "graphql";

import {
    addReportedLinkForHost,
    activeFixtures,
    cloneValue,
    createNode,
    getActiveGraphQLHost,
    getGraphQLFixturesForHost,
    getGraphQLHostFromContext,
    getReportedLinksForHost,
    isPlainObject,
    mergeInto,
    nextNodeId,
    notificationSubscriptions,
    nowIso,
    removeNode,
    searchNode,
    updateNode,
} from "./runtimeState";
import { searchResponseFor } from "./responseHelpers";
import { BACKEND_URL } from "../../../src/gqlFetcher";
import {
    normalizeCartData,
    normalizeCommentData,
    normalizeCompanyData,
    normalizeJobData,
    normalizeOrderData,
    normalizePostData,
    normalizeProductData,
    normalizeStartupData,
    normalizeUserData,
} from "./normalizers";
import type { MockCollection, MockNode } from "./types";
import type { User as GraphQLUser } from "../../../src/generated/graphql";

type GraphQLRequestContext = {
    cypress?: {
        request?: {
            url?: string;
        };
    };
};

const getFixturesForContext = (context: unknown) => {
    const requestUrl = (context as GraphQLRequestContext | undefined)?.cypress?.request?.url;
    if (!requestUrl) {
        return activeFixtures;
    }

    const host = new URL(requestUrl).host;
    return getGraphQLFixturesForHost(host);
};

const matchesSearch = (value: string | null | undefined, term: string | null | undefined): boolean => {
    if (!term) {
        return true;
    }

    return String(value || "").toLowerCase().includes(term.toLowerCase());
};

const ensureCommentState = (comment: MockNode): MockNode => {
    if (comment.hasLiked === undefined) {
        comment.hasLiked = false;
    }
    if (comment.likeCount === undefined) {
        comment.likeCount = 0;
    }
    if (comment.replyCount === undefined) {
        comment.replyCount = 0;
    }
    return comment;
};

const syncCommentReplyCounts = (comments: MockNode[]): void => {
    comments.forEach((comment) => {
        comment.replyCount = comments.filter((candidate) => candidate.replyComment?.id === comment.id).length;
        ensureCommentState(comment);
    });
};

const resolveCollection = (items: MockNode[], args: { page?: number; limit?: number }): MockCollection => {
    const limit = args.limit && args.limit > 0 ? args.limit : items.length > 0 ? items.length : 1;
    const page = args.page && args.page > 0 ? args.page : 1;
    const offset = (page - 1) * limit;

    return {
        docs: items.slice(offset, offset + limit),
        totalDocs: items.length,
        limit,
        totalPages: Math.max(1, Math.ceil(items.length / limit)),
        page,
        hasPrevPage: page > 1,
        hasNextPage: page * limit < items.length,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < items.length ? page + 1 : null,
    };
};

const getOrderProofRows = (order: MockNode): MockNode[] => {
    if (Array.isArray(order.paymentProofs)) {
        return order.paymentProofs as MockNode[];
    }

    if (Array.isArray(order.transactionHashes)) {
        return order.transactionHashes as MockNode[];
    }

    return [];
};

const getOrderQuantityForProduct = (order: MockNode, productId: string): number => {
    const items = Array.isArray(order.items) ? (order.items as MockNode[]) : [];

    return items.reduce((total, item) => {
        const itemProductId = typeof item.product === "string" ? item.product : item.product?.id;

        if (itemProductId !== productId) {
            return total;
        }

        return total + Number(item.quantity ?? 0);
    }, 0);
};

const requireMockUser = (user: MockNode | null | undefined): GraphQLUser => {
    if (!user) {
        throw new Error("Missing meUser fixture");
    }

    return {
        ...user,
        emailVerified: user.emailVerified ?? true,
    } as GraphQLUser;
};

const buildSellerOrderRows = (orders: MockNode[]): MockNode[] => {
    return orders.flatMap((order) => {
        return getOrderProofRows(order).flatMap((proof, index) => {
            const proofProduct = proof.product;
            const productId =
                typeof proofProduct === "string"
                    ? proofProduct
                    : isPlainObject(proofProduct) && typeof proofProduct.id === "string"
                      ? proofProduct.id
                      : "";
            const product =
                typeof proofProduct === "string"
                    ? activeFixtures.products.find((entry) => entry.id === proofProduct)
                    : isPlainObject(proofProduct)
                      ? proofProduct
                      : undefined;
            if (!productId) {
                return [];
            }

            const fulfilled = Boolean(proof.fulfilled);
            const rejected = Boolean(proof.rejected);
            const paymentProofId = typeof proof.id === "string" ? proof.id : `${order.id || "order"}-${productId}-${index}`;

            return [
                {
                    id: paymentProofId,
                    chain: String(proof.chain ?? ""),
                    fulfilled,
                    rejected,
                    orderCreatedAt: String(order.createdAt ?? nowIso()),
                    orderId: String(order.id ?? ""),
                    orderStatus: order.status ? String(order.status) : null,
                    customerEmail: order.customerEmail ?? null,
                    payerAddress: order.payerAddress ?? null,
                    paymentProof: {
                        chain: String(proof.chain ?? ""),
                        fulfilled,
                        rejected,
                        id: paymentProofId,
                        transactionHash: String(proof.transactionHash ?? ""),
                    },
                    paymentProofId,
                    product,
                    productId,
                    quantity: getOrderQuantityForProduct(order, productId),
                    shippingAddress: order.shippingAddress ?? null,
                    transactionHash: String(proof.transactionHash ?? ""),
                },
            ];
        });
    });
};

const updateSellerOrderProofState = ({
    orderId,
    paymentProofId,
    nextState,
}: {
    orderId: string;
    paymentProofId: string;
    nextState: "fulfilled" | "rejected";
}) => {
    const order = activeFixtures.orders.find((item) => item.id === orderId);

    if (!order) {
        return null;
    }

    const proofs = getOrderProofRows(order);
    const proofIndex = proofs.findIndex((proof) => proof.id === paymentProofId);

    if (proofIndex < 0) {
        return null;
    }

    const proof = proofs[proofIndex];
    const nextProof = {
        ...proof,
        fulfilled: nextState === "fulfilled",
        rejected: nextState === "rejected",
    };

    proofs[proofIndex] = nextProof;
    if (Array.isArray(order.paymentProofs)) {
        order.paymentProofs = proofs;
    } else {
        order.transactionHashes = proofs;
    }

    return buildSellerOrderRows([order])[0] || null;
};

const permissionsForHost = (host: string) => {
    if (host === "127.0.0.1:3010") {
        return [
            {
                serverUrl: BACKEND_URL,
                canCreateContentAsNonAdmin: true,
            },
            {
                serverUrl: "http://127.0.0.1:3011",
                canCreateContentAsNonAdmin: false,
            },
        ];
    }

    if (host === "127.0.0.1:3011") {
        return [
            {
                serverUrl: "http://127.0.0.1:3011",
                canCreateContentAsNonAdmin: false,
            },
        ];
    }

    if (host === "127.0.0.1:3013") {
        return [
            {
                serverUrl: BACKEND_URL,
                canCreateContentAsNonAdmin: true,
            },
            {
                serverUrl: "http://127.0.0.1:3012",
                canCreateContentAsNonAdmin: true,
            },
            {
                serverUrl: "http://127.0.0.1:3011",
                canCreateContentAsNonAdmin: false,
            },
        ];
    }

    return [];
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
    Posts: (_parent: unknown, args: { limit?: number; searchTerm?: string }, context: unknown): MockCollection => {
        const fixtures = getFixturesForContext(context);
        const filtered = args.searchTerm
            ? fixtures.posts.filter((post) => matchesSearch(post.title, args.searchTerm) || matchesSearch(post.content, args.searchTerm))
            : fixtures.posts;
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
    Comments: (
        _parent: unknown,
        args: {
            limit?: number;
            where?: {
                AND?: Array<{
                    replyPostRelationTo?: { equals?: string };
                    replyPostValue?: { equals?: string };
                    replyComment?: { equals?: string; exists?: boolean };
                }>;
                replyPostRelationTo?: { equals?: string };
                replyPostValue?: { equals?: string };
                replyComment?: { equals?: string; exists?: boolean };
            };
        },
        context: unknown,
    ): MockCollection => {
        const fixtures = getFixturesForContext(context);
        syncCommentReplyCounts(fixtures.comments);
        const conditions = Array.isArray(args.where?.AND) ? args.where.AND : [args.where];
        const filtered = fixtures.comments.filter((comment) => {
            ensureCommentState(comment);
            return conditions.every((condition) => {
                if (!condition) {
                    return true;
                }
                if (condition.replyComment?.equals) {
                    return comment.replyComment?.id === condition.replyComment.equals;
                }
                if (!condition.replyComment?.exists) {
                    return !comment.replyComment?.id;
                }
                if (condition.replyPostRelationTo?.equals && condition.replyPostValue?.equals) {
                    return comment.replyPostRelationTo === condition.replyPostRelationTo.equals && comment.replyPostValue === condition.replyPostValue.equals;
                }
                return true;
            });
        });
        return resolveCollection(filtered, args);
    },
    sellerOrderProducts: (
        _parent: unknown,
        args: { fulfilled?: boolean; rejected?: boolean; limit?: number; page?: number },
    ): MockCollection => {
        const rows = buildSellerOrderRows(activeFixtures.orders).filter((row) => {
            if (typeof args.fulfilled === "boolean" && Boolean(row.fulfilled) !== args.fulfilled) {
                return false;
            }

            if (typeof args.rejected === "boolean" && Boolean(row.rejected) !== args.rejected) {
                return false;
            }

            return true;
        });

        return resolveCollection(rows, args);
    },
    Syndications: (_parent: unknown, args: { limit?: number }): MockCollection => resolveCollection(activeFixtures.syndications, args),
    permissions: (_parent: unknown, _args: unknown, context: unknown) => {
        const host = getGraphQLHostFromContext(context) || getActiveGraphQLHost();
        return permissionsForHost(host);
    },
    Comment: (_parent: unknown, args: { id?: string }): MockNode => {
        syncCommentReplyCounts(activeFixtures.comments);
        return ensureCommentState(activeFixtures.comments.find((item) => item.id === args.id) || activeFixtures.comments[0]);
    },
    Company: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.companies.find((item) => item.id === args.id) || activeFixtures.companies[0],
    Job: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.jobs.find((item) => item.id === args.id) || activeFixtures.jobs[0],
    Post: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.posts.find((item) => item.id === args.id) || activeFixtures.posts[0],
    Product: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.products.find((item) => item.id === args.id) || activeFixtures.products[0],
    Startup: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.startups.find((item) => item.id === args.id) || activeFixtures.startups[0],
    Identity: (_parent: unknown, args: { id?: string }): MockNode => activeFixtures.identities.find((item) => item.id === args.id) || activeFixtures.identities[0],
    meUser: (_parent: unknown, _args: unknown, context: unknown): MockNode => {
        const user = cloneValue(requireMockUser(activeFixtures.meUser.user));
        const host = getGraphQLHostFromContext(context) || getActiveGraphQLHost();
        const reportedLinks = getReportedLinksForHost(host);
        if (reportedLinks.length > 0) {
            user.reportedLinks = reportedLinks;
        }

        return searchNode({ user });
    },
};

export const mutationResolvers = {
    createCart: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCartData(data);
        if (data.secret === undefined) {
            data.secret = nextNodeId("cart");
        }
        if (data.status === undefined) {
            data.status = "pending";
        }

        return createNode(activeFixtures.carts, "cart", data);
    },
    createInformationRequest: (_parent: unknown, args: { data?: Record<string, unknown> }, context: unknown): MockNode => {
        const data = cloneValue(args.data ?? {});
        const requestId = typeof data.id === "string" ? data.id : nextNodeId("report");
        const fixtures = getFixturesForContext(context);
        const currentUser = requireMockUser(fixtures.meUser.user);

        return searchNode({
            id: requestId,
            reason: typeof data.reason === "string" ? data.reason : "",
            createdAt: nowIso(),
            user: currentUser,
            createdBy: currentUser,
        });
    },
    createReport: (_parent: unknown, args: { data?: Record<string, unknown> }, context: unknown): MockNode => {
        const data = cloneValue(args.data ?? {});
        const reportId = typeof data.id === "string" ? data.id : nextNodeId("report");
        const fixtures = getFixturesForContext(context);
        const currentUser = requireMockUser(fixtures.meUser.user);
        const activeUser = requireMockUser(activeFixtures.meUser.user);
        const host = getGraphQLHostFromContext(context) || getActiveGraphQLHost();
        const reportedLink = typeof data.contentLink === "string" ? data.contentLink : "";

        if (reportedLink) {
            addReportedLinkForHost(host, reportedLink);
            const existing: string[] = currentUser.reportedLinks || [];
            if (!existing.includes(reportedLink)) {
                currentUser.reportedLinks = [...existing, reportedLink];
            }

            if (activeUser !== currentUser) {
                const activeExisting: string[] = activeUser.reportedLinks || [];
                if (!activeExisting.includes(reportedLink)) {
                    activeUser.reportedLinks = [...activeExisting, reportedLink];
                }
            }
        }

        return searchNode({
            id: reportId,
            contentLink: reportedLink,
            reason: typeof data.reason === "string" ? data.reason : "",
            createdAt: nowIso(),
            userId: currentUser,
            createdBy: currentUser,
        });
    },
    shareRepost: (
        _parent: unknown,
        args: { input?: { companyId?: string | null; description?: string | null; link?: string } },
        context: unknown,
    ) => {
        const input = args.input || {};
        const fixtures = getFixturesForContext(context);
        const link = typeof input.link === "string" ? input.link : "";
        const description = typeof input.description === "string" ? input.description : "";
        const company =
            input.companyId ? fixtures.companies.find((item) => item.id === input.companyId) || fixtures.companies[0] : fixtures.companies[0];
        const title = link ? new URL(link).hostname.replace(/^www\./i, "") : "Shared content";
        const post = createNode(
            fixtures.posts,
            "post",
            {
                company: company ? company.id : undefined,
                content: description ? `${description}\n\n[Original content](${link})` : `[Original content](${link})`,
                meta: {
                    title,
                    description: description || title,
                    image: null,
                },
                repost: link,
                title,
                _status: "published",
            },
            "published",
        );

        return {
            company: company ? searchNode({ id: company.id, name: company.name }) : null,
            post,
            source: {
                description: description || title,
                imageURL: null,
                isSinglePageApp: false,
                link,
                title,
            },
        };
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
    createPost: (_parent: unknown, args: { data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizePostData(data);
        if (data.createdBy === undefined) {
            data.createdBy = cloneValue(activeFixtures.meUser.user);
        }
        if (data.hasLiked === undefined) {
            data.hasLiked = false;
        }
        if (data.likeCount === undefined) {
            data.likeCount = 0;
        }
        if (data.contentRankScore === undefined) {
            data.contentRankScore = 0;
        }
        if (data.publishedAt === undefined && !args.draft) {
            data.publishedAt = nowIso();
        }
        if (data._status === undefined) {
            data._status = args.draft ? "draft" : "published";
        }

        return updateNode(activeFixtures.posts, "post-1", data, "post");
    },
    deletePost: (_parent: unknown, args: { id?: string }): MockNode => removeNode(activeFixtures.posts, args.id),
    updatePost: (_parent: unknown, args: { id?: string; data?: Record<string, unknown>; draft?: boolean }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizePostData(data);
        if (args.draft !== undefined && data._status === undefined && data.status === undefined) {
            data._status = args.draft ? "draft" : "published";
        }
        return updateNode(activeFixtures.posts, args.id, data, "post");
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
            data.status = "processing";
        }

        const order = createNode(activeFixtures.orders, "order", data);
        const orderWithCustomerEmail = order as MockNode & { customerEmail?: string };
        if (orderWithCustomerEmail.customerEmail === undefined && typeof order.customer?.email === "string") {
            orderWithCustomerEmail.customerEmail = order.customer.email;
        }
        return order;
    },
    updateOrder: (_parent: unknown, args: { id?: string; orderId?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeOrderData(data);
        return updateNode(activeFixtures.orders, args.id ?? args.orderId, data, "order");
    },
    updateSellerOrderProductFulfilled: (_parent: unknown, args: { orderId?: string; paymentProofId?: string; fulfilled?: boolean }) => {
        const result = updateSellerOrderProofState({
            orderId: String(args.orderId ?? ""),
            paymentProofId: String(args.paymentProofId ?? ""),
            nextState: "fulfilled",
        });

        return result || searchNode({ id: args.paymentProofId });
    },
    updateSellerOrderProductRejected: (_parent: unknown, args: { orderId?: string; paymentProofId?: string; rejected?: boolean }) => {
        const result = updateSellerOrderProofState({
            orderId: String(args.orderId ?? ""),
            paymentProofId: String(args.paymentProofId ?? ""),
            nextState: "rejected",
        });

        return result || searchNode({ id: args.paymentProofId });
    },
    createComment: (_parent: unknown, args: { data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        normalizeCommentData(data);
        if (data.serverUrl === undefined) {
            data.serverUrl = activeFixtures.comments[0]?.serverUrl;
        }
        if (data.createdBy === undefined) {
            data.createdBy = cloneValue(activeFixtures.meUser.user);
        }
        if (data.anonymousHash === undefined) {
            data.anonymousHash = `anon-${nextNodeId("comment")}`;
        }
        if (data.hasLiked === undefined) {
            data.hasLiked = false;
        }
        if (data.likeCount === undefined) {
            data.likeCount = 0;
        }

        const created = ensureCommentState(createNode(activeFixtures.comments, "comment", data));
        syncCommentReplyCounts(activeFixtures.comments);
        return created;
    },
    deleteComment: (_parent: unknown, args: { id?: string }): MockNode => {
        const removed = removeNode(activeFixtures.comments, args.id);
        syncCommentReplyCounts(activeFixtures.comments);
        return removed;
    },
    updateComment: (_parent: unknown, args: { id?: string; content?: string; data?: Record<string, unknown> }): MockNode => {
        const data = cloneValue(args.data ?? {});
        if (args.content !== undefined) {
            data.content = args.content;
        }
        normalizeCommentData(data);
        const updated = ensureCommentState(updateNode(activeFixtures.comments, args.id, data, "comment"));
        syncCommentReplyCounts(activeFixtures.comments);
        return updated;
    },
    updateCommentContent: (_parent: unknown, args: { id?: string; content?: string }): MockNode => {
        const data = cloneValue({ content: args.content });
        const updated = ensureCommentState(updateNode(activeFixtures.comments, args.id, data, "comment"));
        syncCommentReplyCounts(activeFixtures.comments);
        return updated;
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
        const member = cloneValue(requireMockUser(activeFixtures.meUser.user)) as GraphQLUser;

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
        const memberId = requireMockUser(activeFixtures.meUser.user).id;

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
        const user = requireMockUser(activeFixtures.meUser.user);
        if (user && user.id === args.id) {
            mergeInto(user, data);
            return user;
        }

        const updated = searchNode({
            id: args.id,
        });
        mergeInto(updated, data);
        return updated;
    },
    setLikeState: (_parent: unknown, args: { collection?: string; id?: string; liked?: boolean }): MockNode => {
        const collectionMap: Record<string, MockNode[] | undefined> = {
            companies: activeFixtures.companies,
            identities: activeFixtures.identities,
            jobs: activeFixtures.jobs,
            comments: activeFixtures.comments,
            posts: activeFixtures.posts,
            products: activeFixtures.products,
            startups: activeFixtures.startups,
        };
        const items = collectionMap[args.collection || ""];
        if (!items) {
            return searchNode({
                collection: args.collection,
                hasLiked: args.liked,
                id: args.id,
                likeCount: 0,
            });
        }

        const target = items.find((item) => item.id === args.id) || items[0];
        if (!target) {
            return searchNode({
                collection: args.collection,
                hasLiked: args.liked,
                id: args.id,
                likeCount: 0,
            });
        }

        const liked = Boolean(args.liked);
        const currentHasLiked = Boolean(target.hasLiked);
        const currentLikeCount = typeof target.likeCount === "number" ? target.likeCount : 0;
        const nextLikeCount = currentHasLiked === liked ? currentLikeCount : Math.max(0, currentLikeCount + (liked ? 1 : -1));
        target.hasLiked = liked;
        target.likeCount = nextLikeCount;
        target.updatedAt = nowIso();

        return searchNode({
            collection: args.collection,
            hasLiked: liked,
            id: target.id,
            likeCount: nextLikeCount,
        });
    },
    trackAnalyticsEvent: (): MockNode => ({
        success: true,
        analytics: { distinctId: "distinct-mock", eventId: "event-mock", sessionId: "session-mock" },
    }),
};
