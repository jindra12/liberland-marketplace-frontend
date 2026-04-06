import { GraphQLScalarType, buildSchema, valueFromASTUntyped } from "graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GraphQLHandler } from "graphql-mocks";
import { cypressHandler } from "@graphql-mocks/network-cypress";

import { carts, companies, comments, identities, jobs, meUser, orders, products, startups, syndications } from "./fixtures";
import type { MockCollection, MockNode } from "./types";

type GraphQLRequestBody = {
    operationName?: string;
    variables?: {
        searchTerm?: string;
    };
    query?: string;
};

const scalar = (name: string) =>
    new GraphQLScalarType({
        name,
        serialize: (value) => value,
        parseValue: (value) => value,
        parseLiteral: (ast) => valueFromASTUntyped(ast),
    });

const mockScalarMap = [
    "JSON",
    "AnalyticsTrackInput",
    "Comment_ReplyPostRelationshipInput",
    "mutationCartInput",
    "mutationCartUpdateInput",
    "mutationCompanyInput",
    "mutationCompanyUpdateInput",
    "mutationJobInput",
    "mutationJobUpdateInput",
    "mutationOrderInput",
    "mutationOrderUpdateInput",
    "mutationProductInput",
    "mutationProductUpdateInput",
    "mutationStartupInput",
    "mutationStartupUpdateInput",
    "mutationUserUpdateInput",
].reduce<Record<string, GraphQLScalarType>>((accumulator, name) => {
    accumulator[name] = scalar(name);
    return accumulator;
}, {});

const collection = (docs: MockNode[]): MockCollection => ({
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

const byId = (items: MockNode[], id?: string): MockNode => items.find((item) => item.id === id) || items[0];

const includes = (value: string | undefined, term: string | undefined): boolean => {
    if (!term) {
        return true;
    }
    return String(value || "").toLowerCase().includes(term.toLowerCase());
};

const getSearchTerm = (body: GraphQLRequestBody): string | undefined => body.variables?.searchTerm;

const buildSearchCollection = (docs: MockNode[]): MockCollection => collection(docs);

const searchNode = (value: Record<string, unknown>): MockNode => value as MockNode;

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

const searchResponseFor = (operationName: string | undefined, body: GraphQLRequestBody): MockCollection => {
    const term = getSearchTerm(body);

    if (operationName === "SearchJobs" || operationName === "SearchJobsByCompany" || operationName === "SearchJobsBySecondaryIdentity") {
        return buildSearchCollection(
            jobs.filter((job) => includes(job.title, term) || includes(job.description, term)).map((job, index) => buildSearchDoc("jobs", job, index)),
        );
    }

    if (
        operationName === "SearchCompanies" ||
        operationName === "SearchCompaniesByIdentity" ||
        operationName === "SearchCompaniesBySecondaryIdentity"
    ) {
        return buildSearchCollection(
            companies.filter((company) => includes(company.name, term) || includes(company.description, term)).map((company, index) => buildSearchDoc("companies", company, index)),
        );
    }

    if (
        operationName === "SearchProducts" ||
        operationName === "SearchProductsByCompany" ||
        operationName === "SearchProductsByIdentity"
    ) {
        return buildSearchCollection(
            products.filter((product) => includes(product.name, term) || includes(product.description, term)).map((product, index) => buildSearchDoc("products", product, index)),
        );
    }

    if (operationName === "SearchIdentities") {
        return buildSearchCollection(
            identities.filter((identity) => includes(identity.name, term) || includes(identity.description, term)).map((identity, index) => buildSearchDoc("identities", identity, index)),
        );
    }

    if (operationName === "SearchStartups") {
        return buildSearchCollection(
            startups.filter((startup) => includes(startup.title, term) || includes(startup.description, term)).map((startup, index) => buildSearchDoc("startups", startup, index)),
        );
    }

    return buildSearchCollection([]);
};

const resolveCollection = (items: MockNode[], args: { page?: number; limit?: number }): MockCollection => {
    return collection(items.slice(0, args.limit || items.length));
};

const queryResolvers = {
    Carts: (_parent: unknown, args: { limit?: number; where?: { secret?: { equals?: string } } }, _context: unknown, info: GraphQLResolveInfo): MockCollection => {
        const filtered = args.where?.secret?.equals ? carts.filter((item) => item.secret === args.where?.secret?.equals) : carts;
        return info.operation.name?.value === "CartBySecret" ? resolveCollection(filtered, { limit: 1 }) : resolveCollection(filtered, args);
    },
    Searches: (_parent: unknown, args: { limit?: number }, _context: unknown, info: GraphQLResolveInfo): MockCollection => {
        return searchResponseFor(info.operation.name?.value, { query: "", variables: { searchTerm: undefined } });
    },
    Companies: (_parent: unknown, args: { limit?: number; searchTerm?: string }, _context: unknown): MockCollection => {
        const filtered = args.searchTerm ? companies.filter((company) => includes(company.name, args.searchTerm) || includes(company.description, args.searchTerm)) : companies;
        return resolveCollection(filtered, args);
    },
    Jobs: (_parent: unknown, args: { limit?: number; searchTerm?: string }, _context: unknown): MockCollection => {
        const filtered = args.searchTerm ? jobs.filter((job) => includes(job.title, args.searchTerm) || includes(job.description, args.searchTerm)) : jobs;
        return resolveCollection(filtered, args);
    },
    Products: (_parent: unknown, args: { limit?: number; searchTerm?: string }, _context: unknown): MockCollection => {
        const filtered = args.searchTerm ? products.filter((product) => includes(product.name, args.searchTerm) || includes(product.description, args.searchTerm)) : products;
        return resolveCollection(filtered, args);
    },
    Startups: (_parent: unknown, args: { limit?: number; searchTerm?: string }, _context: unknown): MockCollection => {
        const filtered = args.searchTerm ? startups.filter((startup) => includes(startup.title, args.searchTerm) || includes(startup.description, args.searchTerm)) : startups;
        return resolveCollection(filtered, args);
    },
    Identities: (_parent: unknown, args: { limit?: number; searchTerm?: string }, _context: unknown): MockCollection => {
        const filtered = args.searchTerm ? identities.filter((identity) => includes(identity.name, args.searchTerm) || includes(identity.description, args.searchTerm)) : identities;
        return resolveCollection(filtered, args);
    },
    Comments: (_parent: unknown, args: { limit?: number; where?: { replyPostRelationTo?: { equals?: string }; replyPostValue?: { equals?: string }; replyComment?: { equals?: string } } }, _context: unknown): MockCollection => {
        const filtered = comments.filter((comment) => {
            if (args.where?.replyComment?.equals) {
                return comment.replyComment?.id === args.where.replyComment.equals;
            }
            if (args.where?.replyPostRelationTo?.equals && args.where?.replyPostValue?.equals) {
                return comment.replyPostRelationTo === args.where.replyPostRelationTo.equals && comment.replyPostValue === args.where.replyPostValue.equals;
            }
            return true;
        });
        return resolveCollection(filtered, args);
    },
    Syndications: (_parent: unknown, args: { limit?: number }, _context: unknown): MockCollection => resolveCollection(syndications, args),
    Company: (_parent: unknown, args: { id?: string }, _context: unknown): MockNode => byId(companies, args.id),
    Job: (_parent: unknown, args: { id?: string }, _context: unknown): MockNode => byId(jobs, args.id),
    Product: (_parent: unknown, args: { id?: string }, _context: unknown): MockNode => byId(products, args.id),
    Startup: (_parent: unknown, args: { id?: string }, _context: unknown): MockNode => byId(startups, args.id),
    Identity: (_parent: unknown, args: { id?: string }, _context: unknown): MockNode => byId(identities, args.id),
    meUser: (): MockNode => meUser,
};

const mutationResolvers = {
    createCart: (): MockNode => carts[0],
    deleteCart: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateCart: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createCompany: (): MockNode => companies[0],
    deleteCompany: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateCompany: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createJob: (): MockNode => jobs[0],
    deleteJob: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateJob: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createProduct: (): MockNode => products[0],
    deleteProduct: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateProduct: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createStartup: (): MockNode => startups[0],
    deleteStartup: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateStartup: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createOrder: (): MockNode => orders[0],
    updateOrder: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    createComment: (_parent: unknown, args: { data?: { content?: string } }): MockNode => ({ id: "comment-created", content: args.data?.content || "Mock comment" }),
    deleteComment: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    updateCommentContent: (_parent: unknown, args: { id?: string; content?: string }): MockNode => ({ id: args.id, content: args.content }),
    createNotificationSubscription: (_parent: unknown, args: { data?: { email?: string; targetCollection?: string; targetID?: string } }): MockNode => ({ id: "subscription-created", email: args.data?.email, targetCollection: args.data?.targetCollection, targetID: args.data?.targetID }),
    deleteNotificationSubscription: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id }),
    joinStartup: (_parent: unknown, args: { id?: string }): MockNode => ({ message: "Joined", startup: { id: args.id, title: startups[0].title, involvedUsers: [identities[0], identities[2]] } }),
    leaveStartup: (_parent: unknown, args: { id?: string }): MockNode => ({ message: "Left", startup: { id: args.id, title: startups[0].title, involvedUsers: [identities[0]] } }),
    updateUser: (_parent: unknown, args: { id?: string }): MockNode => ({ id: args.id, name: "Nova Rivers", email: "nova@example.test" }),
    trackAnalyticsEvent: (): MockNode => ({ success: true, analytics: { distinctId: "distinct-mock", eventId: "event-mock", sessionId: "session-mock" } }),
};

const schema = buildSchema(`
    scalar JSON
    scalar AnalyticsTrackInput
    scalar Comment_ReplyPostRelationshipInput
    scalar mutationCartInput
    scalar mutationCartUpdateInput
    scalar mutationCompanyInput
    scalar mutationCompanyUpdateInput
    scalar mutationJobInput
    scalar mutationJobUpdateInput
    scalar mutationOrderInput
    scalar mutationOrderUpdateInput
    scalar mutationProductInput
    scalar mutationProductUpdateInput
    scalar mutationStartupInput
    scalar mutationStartupUpdateInput
    scalar mutationUserUpdateInput

    type Query {
        Carts(draft: Boolean, limit: Int, where: JSON): MockCollection!
        Searches(draft: Boolean, limit: Int, page: Int, sort: String, where: JSON): MockCollection!
        Companies(draft: Boolean, limit: Int, searchTerm: String, where: JSON): MockCollection!
        Jobs(draft: Boolean, limit: Int, searchTerm: String, where: JSON): MockCollection!
        Products(draft: Boolean, limit: Int, searchTerm: String, where: JSON): MockCollection!
        Startups(draft: Boolean, limit: Int, searchTerm: String, where: JSON): MockCollection!
        Identities(draft: Boolean, limit: Int, searchTerm: String, where: JSON): MockCollection!
        Comments(draft: Boolean, limit: Int, sort: String, where: JSON): MockCollection!
        Syndications(draft: Boolean, limit: Int, where: JSON): MockCollection!
        Company(id: String!, draft: Boolean): MockNode
        Job(id: String!, draft: Boolean): MockNode
        Product(id: String!, draft: Boolean): MockNode
        Startup(id: String!, draft: Boolean): MockNode
        Identity(id: String!, draft: Boolean): MockNode
        meUser: MockNode
    }

    type Mutation {
        createCart(data: mutationCartInput, draft: Boolean): MockNode
        deleteCart(id: String!): MockNode
        updateCart(id: String!, data: mutationCartUpdateInput, draft: Boolean): MockNode
        createCompany(data: mutationCompanyInput, draft: Boolean): MockNode
        deleteCompany(id: String!): MockNode
        updateCompany(id: String!, data: mutationCompanyUpdateInput, draft: Boolean): MockNode
        createJob(data: mutationJobInput, draft: Boolean): MockNode
        deleteJob(id: String!): MockNode
        updateJob(id: String!, data: mutationJobUpdateInput, draft: Boolean): MockNode
        createProduct(data: mutationProductInput, draft: Boolean): MockNode
        deleteProduct(id: String!): MockNode
        updateProduct(id: String!, data: mutationProductUpdateInput, draft: Boolean): MockNode
        createStartup(data: mutationStartupInput, draft: Boolean): MockNode
        deleteStartup(id: String!): MockNode
        updateStartup(id: String!, data: mutationStartupUpdateInput, draft: Boolean): MockNode
        createOrder(data: mutationOrderInput, draft: Boolean): MockNode
        updateOrder(id: String!, data: mutationOrderUpdateInput, draft: Boolean): MockNode
        createComment(data: JSON): MockNode
        deleteComment(id: String!): MockNode
        updateCommentContent(id: String!, content: String!): MockNode
        createNotificationSubscription(data: JSON): MockNode
        deleteNotificationSubscription(id: String!): MockNode
        joinStartup(id: String!): MockNode
        leaveStartup(id: String!): MockNode
        updateUser(id: String!, data: mutationUserUpdateInput): MockNode
        trackAnalyticsEvent(input: AnalyticsTrackInput): MockNode
    }

    type MockCollection {
        docs: [MockNode!]!
        totalDocs: Int!
        limit: Int!
        totalPages: Int!
        page: Int!
        hasPrevPage: Boolean!
        hasNextPage: Boolean!
        prevPage: Int
        nextPage: Int
    }

    type MockNode {
        id: JSON
        name: JSON
        title: JSON
        description: JSON
        serverURL: JSON
        _status: JSON
        website: JSON
        phone: JSON
        email: JSON
        content: JSON
        anonymousHash: JSON
        replyPostRelationTo: JSON
        replyPostValue: JSON
        currency: JSON
        secret: JSON
        subtotal: JSON
        status: JSON
        createdAt: JSON
        updatedAt: JSON
        deletedAt: JSON
        priceInUSDEnabled: JSON
        priceInUSD: JSON
        priceInETH: JSON
        priceInSOL: JSON
        priceInTRX: JSON
        inventory: JSON
        enableVariants: JSON
        orderable: JSON
        companyIdentityId: JSON
        url: JSON
        applyUrl: JSON
        salaryRange: JSON
        location: JSON
        employmentType: JSON
        stage: JSON
        lookingFor: JSON
        itemCount: JSON
        amount: JSON
        quantity: JSON
        purchasedAt: JSON
        payerAddress: JSON
        chain: JSON
        address: JSON
        value: JSON
        label: JSON
        key: JSON
        mimeType: JSON
        filename: JSON
        width: JSON
        height: JSON
        alt: JSON
        isSubscribed: JSON
        isActive: JSON
        success: JSON
        limit: JSON
        page: JSON
        totalDocs: JSON
        totalPages: JSON
        hasNextPage: JSON
        hasPrevPage: JSON
        nextPage: JSON
        prevPage: JSON
        targetCollection: JSON
        targetID: JSON
        distinctId: JSON
        eventId: JSON
        sessionId: JSON
        transactionHash: JSON
        nativePerStable: JSON
        stablePerNative: JSON
        expectedNativeAmount: JSON
        fetchedAt: JSON
        priority: JSON
        postedAt: JSON
        relationTo: JSON
        firstName: JSON
        lastName: JSON
        city: JSON
        state: JSON
        postalCode: JSON
        country: JSON
        addressLine1: JSON
        addressLine2: JSON
        provider: JSON
        message: JSON
        allowedIdentities: [MockNode!]
        disallowedIdentities: [MockNode!]
        cryptoAddresses: [MockNode!]
        docs: [MockNode!]
        involvedUsers: [MockNode!]
        items: [MockNode!]
        options: [MockNode!]
        properties: [MockNode!]
        transactions: [MockNode!]
        transactionHashes: [MockNode!]
        variantTypes: [MockNode!]
        wallets: [MockNode!]
        cryptoPrices: [MockNode!]
        image: MockNode
        company: MockNode
        identity: MockNode
        createdBy: MockNode
        user: MockNode
        customer: MockNode
        product: MockNode
        startup: MockNode
        job: MockNode
        doc: MockNode
        replyComment: MockNode
        replyPost: MockNode
        variant: MockNode
        variantType: MockNode
        shippingAddress: MockNode
        bounty: MockNode
        fundsNeeded: MockNode
        analytics: MockNode
        variants: MockCollection
    }
`);

const graphqlHandler = new GraphQLHandler({
    dependencies: {
        graphqlSchema: schema,
    },
    scalarMap: mockScalarMap,
    resolverMap: {
        Query: queryResolvers as Record<string, (...args: any[]) => any>,
        Mutation: mutationResolvers as Record<string, (...args: any[]) => any>,
    },
});

export const installGraphQLMock = () => {
    const handler = cypressHandler(graphqlHandler);
    cy.intercept("POST", /http:\/\/127\.0\.0\.1:301[01]\/api\/graphql$/, async (req) => {
        const body = req.body as GraphQLRequestBody;

        if (body.operationName && body.operationName.startsWith("Search")) {
            const response = searchResponseFor(body.operationName, body);
            req.reply({
                statusCode: 200,
                body: {
                    data: {
                        Searches: response,
                    },
                },
            });
            return;
        }

        await handler(req);
    });
};
