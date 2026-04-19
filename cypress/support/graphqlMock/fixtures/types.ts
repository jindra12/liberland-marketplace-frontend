import type { Cart, Comment, Company, Identity, Job, Order, Post, Product, Startup, Syndication, User } from "../../../../src/generated/graphql";

export type GraphQLFixtureBundle = {
    identities: Identity[];
    companies: Company[];
    products: Product[];
    jobs: Job[];
    startups: Startup[];
    posts: Post[];
    comments: Comment[];
    syndications: Syndication[];
    carts: Cart[];
    orders: Order[];
    meUser: { user: User };
};
