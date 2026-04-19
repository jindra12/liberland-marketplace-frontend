import { comments } from "./coopFixtures/comments";
import { companies } from "./coopFixtures/companies";
import { identities } from "./coopFixtures/identities";
import { carts } from "./coopFixtures/carts";
import { meUser } from "./coopFixtures/meUser";
import { orders } from "./coopFixtures/orders";
import { syndications } from "./coopFixtures/syndications";
import { jobs } from "./coopFixtures/jobs";
import { posts } from "./coopFixtures/posts";
import { products } from "./coopFixtures/products";
import { startups } from "./coopFixtures/startups";
import type { GraphQLFixtureBundle } from "./fixtures/types";

export const coopFixtures: GraphQLFixtureBundle = {
    identities,
    companies,
    products,
    jobs,
    startups,
    posts,
    comments,
    syndications,
    carts,
    orders,
    meUser,
};
