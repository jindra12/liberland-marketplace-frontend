import { comments } from "./comments";
import { companies } from "./companies";
import { identities } from "./identities";
import { carts } from "./carts";
import { meUser } from "./meUser";
import { orders } from "./orders";
import { syndications } from "./syndications";
import { jobs } from "./jobs";
import { posts } from "./posts";
import { products } from "./catalog";
import { startups } from "./startups";
import type { GraphQLFixtureBundle } from "./types";

export const mainFixtures: GraphQLFixtureBundle = {
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
