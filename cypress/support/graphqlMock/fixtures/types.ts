import type { Cart, Comment, Company, Identity, Job, MeUserQuery, Post, Product, Startup, Syndication } from "../../../../src/generated/graphql";
import type { MockNode } from "../types";

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
    orders: MockNode[];
    meUser: NonNullable<MeUserQuery["meUser"]>;
};
