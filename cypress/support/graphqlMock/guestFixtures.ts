import { carts } from "./guestFixtures/carts";
import { comments } from "./guestFixtures/comments";
import { companies } from "./guestFixtures/companies";
import { identities } from "./guestFixtures/identities";
import { jobs } from "./guestFixtures/jobs";
import { meUser } from "./guestFixtures/meUser";
import { orders } from "./guestFixtures/orders";
import { posts } from "./guestFixtures/posts";
import { products } from "./guestFixtures/products";
import { startups } from "./guestFixtures/startups";
import { syndications } from "./guestFixtures/syndications";
import type { GraphQLFixtureBundle } from "./fixtures/types";

export const guestFixtures: GraphQLFixtureBundle = {
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
