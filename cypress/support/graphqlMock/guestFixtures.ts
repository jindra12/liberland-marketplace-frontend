import type { GraphQLFixtureBundle, MockCollection, MockNode } from "./types";

const GUEST_SYNDICATION_URL = "http://127.0.0.1:3012";

const node = (value: Record<string, unknown>): MockNode => value as MockNode;

const image = (id: string, alt: string): MockNode =>
    node({
        id,
        url: `/images/${id}.png`,
        alt,
        filename: `${id}.png`,
        mimeType: "image/png",
        width: 1200,
        height: 800,
    });

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
    comments: [],
    syndications,
    carts: [],
    orders: [],
    meUser,
};
