import type { GraphQLFixtureBundle, MockCollection, MockNode } from "./types";
import { buildMockImageNode } from "./imageAssets";

const GUEST_SYNDICATION_URL = "http://127.0.0.1:3012";

const node = (value: Record<string, unknown>): MockNode => value as MockNode;

const image = (id: string, alt: string): MockNode => buildMockImageNode(id, alt, id.startsWith("guest-post-") ? "hero" : "avatar");

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

const identities = [
    node({
        id: "guest-identity-mira",
        name: "Mira Harbor",
        description: "Guest shopper",
        website: "https://mira.example",
        email: "mira@example.test",
        serverURL: GUEST_SYNDICATION_URL,
        image: image("guest-identity-mira", "Mira Harbor"),
    }),
];

const companies = [
    node({
        id: "guest-company-harbor-craft",
        name: "Harbor Craft",
        description: "Guest storefront with a company wallet",
        website: "https://harbor-craft.example",
        phone: "+1 555 7700",
        email: "hello@harbor-craft.example",
        serverURL: GUEST_SYNDICATION_URL,
        _status: "published",
        isSubscribed: false,
        createdBy: identities[0],
        identity: identities[0],
        allowedIdentities: [identities[0]],
        disallowedIdentities: [],
        cryptoAddresses: [node({ chain: "ethereum", address: "0xGuestHarbor777" })],
        image: image("guest-company-harbor-craft", "Harbor Craft"),
    }),
];

const products = [
    node({
        id: "guest-product-harbor-light",
        name: "Harbor Light",
        description: "Orderable guest product with company-level Ethereum payments",
        serverURL: GUEST_SYNDICATION_URL,
        _status: "published",
        isSubscribed: false,
        url: "/products/harbor-light",
        inventory: 8,
        orderable: true,
        enableVariants: false,
        companyIdentityId: identities[0].id,
        priceInUSDEnabled: true,
        priceInUSD: 42,
        priceInETH: 0.017,
        priceInSOL: 0.44,
        priceInTRX: 61,
        cryptoAddresses: null,
        variantTypes: [],
        variants: collection([]),
        properties: [node({ id: "guest-product-prop-1", key: "finish", value: "matte" })],
        image: image("guest-product-harbor-light", "Harbor Light"),
        company: companies[0],
    }),
    node({
        id: "guest-product-harbor-brochure",
        name: "Harbor Brochure",
        description: "Non-orderable guest product",
        serverURL: GUEST_SYNDICATION_URL,
        _status: "published",
        isSubscribed: false,
        url: "https://harbor-craft.example/products/harbor-brochure",
        inventory: 2,
        orderable: false,
        enableVariants: false,
        companyIdentityId: identities[0].id,
        priceInUSDEnabled: true,
        priceInUSD: 9,
        priceInETH: 0.002,
        priceInSOL: 0.06,
        priceInTRX: 8,
        cryptoAddresses: null,
        variantTypes: [],
        variants: collection([]),
        properties: [node({ id: "guest-product-prop-2", key: "format", value: "digital" })],
        image: image("guest-product-harbor-brochure", "Harbor Brochure"),
        company: companies[0],
    }),
];

const posts = [
    node({
        id: "guest-post-guest-market-notes",
        title: "Guest Market Notes",
        slug: "guest-market-notes",
        description: "A small note from the guest server",
        content: "Guest market notes focused on simpler publishing and a tighter product overview.",
        serverURL: GUEST_SYNDICATION_URL,
        _status: "published",
        isSubscribed: false,
        company: companies[0],
        heroImage: image("guest-post-guest-market-notes", "Guest Market Notes"),
        meta: node({
            title: "Guest Market Notes",
            description: "A small note from the guest server",
            image: image("guest-post-guest-market-notes-meta", "Guest Market Notes meta"),
        }),
        categories: [node({ id: "guest-category-notes", title: "Notes", slug: "notes" })],
        populatedAuthors: [
            node({
                id: identities[0].id,
                nickname: identities[0].name,
                image: identities[0].image,
            }),
        ],
        hasLiked: false,
        likeCount: 2,
        publishedAt: "2025-03-07T09:00:00.000Z",
        createdAt: "2025-03-06T09:00:00.000Z",
        updatedAt: "2025-03-07T09:15:00.000Z",
        contentRankScore: 60,
    }),
];

const syndications = [
    node({
        id: "guest-syndication-main",
        name: "Guest",
        description: "Guest test server",
        url: GUEST_SYNDICATION_URL,
        enabled: true,
    }),
];

const meUser = node({
    user: node({
        id: "guest-user-mira",
        name: "Mira Harbor",
        email: "mira@example.test",
        phone: "+1 555 7701",
        shippingAddress: null,
        wallets: [],
    }),
});

export const guestFixtures: GraphQLFixtureBundle = {
    identities,
    companies,
    products,
    jobs: [],
    startups: [],
    posts,
    comments: [],
    syndications,
    carts: [],
    orders: [],
    meUser,
};
