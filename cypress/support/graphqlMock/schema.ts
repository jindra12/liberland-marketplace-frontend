import { buildSchema } from "graphql";

export const graphqlSchema = buildSchema(`
    scalar JSON
    scalar AnalyticsTrackInput
    scalar Comment_ReplyPostRelationshipInput
    scalar mutationCartInput
    scalar mutationCartUpdateInput
    scalar mutationCompanyInput
    scalar mutationCompanyUpdateInput
    scalar mutationJobInput
    scalar mutationJobUpdateInput
    scalar mutationPostInput
    scalar mutationPostUpdateInput
    scalar mutationOrderInput
    scalar mutationOrderUpdateInput
    scalar mutationProductInput
    scalar mutationProductUpdateInput
    scalar mutationStartupInput
    scalar mutationStartupUpdateInput
    scalar mutationUserUpdateInput

    enum LikeableCollectionMutation {
        companies
        identities
        jobs
        posts
        products
        startups
        ventures
    }

    type Query {
        Carts(draft: Boolean, limit: Int, page: Int, where: JSON): MockCollection!
        Searches(draft: Boolean, limit: Int, page: Int, sort: String, where: JSON): MockCollection!
        Companies(
            draft: Boolean
            limit: Int
            page: Int
            sort: String
            searchTerm: String
            where: JSON
            identityId: JSON
            companyId: JSON
            userId: JSON
        ): MockCollection!
        Jobs(
            draft: Boolean
            limit: Int
            page: Int
            sort: String
            searchTerm: String
            where: JSON
            companyId: JSON
            identityId: JSON
            userId: JSON
            companyIds: [JSON!]
        ): MockCollection!
        Products(
            draft: Boolean
            limit: Int
            page: Int
            sort: String
            searchTerm: String
            where: JSON
            companyId: JSON
            identityId: JSON
            companyIds: [JSON]
        ): MockCollection!
        Startups(
            draft: Boolean
            limit: Int
            page: Int
            sort: String
            searchTerm: String
            where: JSON
            companyId: JSON
            identityId: JSON
            userId: JSON
        ): MockCollection!
        Identities(draft: Boolean, limit: Int, page: Int, sort: String, searchTerm: String, where: JSON): MockCollection!
        Comments(draft: Boolean, limit: Int, page: Int, sort: String, where: JSON): MockCollection!
        Syndications(draft: Boolean, limit: Int, page: Int, where: JSON): MockCollection!
        Company(id: String!, draft: Boolean): MockNode
        Job(id: String!, draft: Boolean): MockNode
        Post(id: String!, draft: Boolean): MockNode
        Product(id: String!, draft: Boolean): MockNode
        Startup(id: String!, draft: Boolean): MockNode
        Identity(id: String!, draft: Boolean): MockNode
        meUser: MockNode
    }

    type Mutation {
        createCart(data: mutationCartInput, draft: Boolean): MockNode
        deleteCart(id: String!, trash: Boolean): MockNode
        updateCart(id: String!, data: mutationCartUpdateInput, draft: Boolean): MockNode
        createCompany(data: mutationCompanyInput, draft: Boolean): MockNode
        deleteCompany(id: String!): MockNode
        updateCompany(id: String!, data: mutationCompanyUpdateInput, draft: Boolean): MockNode
        createJob(data: mutationJobInput, draft: Boolean): MockNode
        deleteJob(id: String!): MockNode
        updateJob(id: String!, data: mutationJobUpdateInput, draft: Boolean): MockNode
        createPost(data: mutationPostInput, draft: Boolean): MockNode
        deletePost(id: String!): MockNode
        updatePost(id: String!, data: mutationPostUpdateInput, draft: Boolean): MockNode
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
        setLikeState(collection: LikeableCollectionMutation!, id: String!, liked: Boolean!): LikeStateMutationResult
        trackAnalyticsEvent(input: AnalyticsTrackInput): MockNode
    }

    type LikeStateMutationResult {
        collection: LikeableCollectionMutation
        hasLiked: Boolean
        id: String
        likeCount: Int
    }

    type SalaryRange {
        min: Float
        max: Float
        currency: String
    }

    enum StartupLookingFor {
        funding
        founders
        team
        traction
        distribution
        production
        idea
        product
    }

    enum StartupAlreadyHave {
        funding
        founders
        team
        traction
        distribution
        production
        idea
        product
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
        slug: JSON
        serverURL: JSON
        _status: JSON
        website: JSON
        phone: JSON
        email: JSON
        content: JSON
        anonymousHash: JSON
        replyPostRelationTo: JSON
        replyPostValue: JSON
        likeCount: JSON
        hasLiked: JSON
        currency: JSON
        secret: JSON
        subtotal: JSON
        customerEmail: JSON
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
        salaryRange: SalaryRange
        positions: Float
        location: JSON
        employmentType: JSON
        stage: JSON
        lookingFor: [StartupLookingFor!]
        alreadyHave: [StartupAlreadyHave!]
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
        publishedAt: JSON
        contentRankScore: JSON
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
        categories: [MockNode!]
        populatedAuthors: [MockNode!]
        options: [MockNode!]
        properties: [MockNode!]
        transactions: [MockNode!]
        transactionHashes: [MockNode!]
        variantTypes: [MockNode!]
        wallets: [MockNode!]
        cryptoPrices: [MockNode!]
        image: MockNode
        heroImage: MockNode
        meta: MockNode
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
        shippingAddress: User_ShippingAddress
        bounty: MockNode
        fundsNeeded: MockNode
        analytics: MockNode
        variants: MockCollection
    }

    type User_ShippingAddress {
        title: JSON
        firstName: JSON
        lastName: JSON
        company: String
        addressLine1: JSON
        addressLine2: JSON
        city: JSON
        state: JSON
        postalCode: JSON
        country: JSON
        phone: JSON
    }
`);
