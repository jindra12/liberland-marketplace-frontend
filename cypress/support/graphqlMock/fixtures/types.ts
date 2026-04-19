import type { Cart, Comment, Company, Identity, Job, MeUserQuery, Order, Post, Product, Startup, Syndication } from "../../../../src/generated/graphql";

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
    meUser: NonNullable<MeUserQuery["meUser"]>;
};
