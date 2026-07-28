import { image, COOP_SYNDICATION_URL } from "../fixtures/shared";
import { meUser } from "./meUser";
import type { Identity } from "../../../../src/generated/graphql";

export const identities: Identity[] = [
    {
        id: "coop-identity-iris",
        name: "Iris Shore",
        description: "Shipping coordinator",
        website: "https://iris.example",
        serverURL: COOP_SYNDICATION_URL,
        createdBy: meUser.user,
        image: image("coop-identity-iris", "Iris Shore"),
    },
    {
        id: "coop-identity-luca",
        name: "Luca Vale",
        description: "Community builder",
        website: "https://luca.example",
        serverURL: COOP_SYNDICATION_URL,
        createdBy: meUser.user,
        image: image("coop-identity-luca", "Luca Vale"),
    },
    {
        id: "coop-identity-rhea",
        name: "Rhea Moss",
        description: "Operations lead",
        website: "https://rhea.example",
        serverURL: COOP_SYNDICATION_URL,
        createdBy: meUser.user,
        image: image("coop-identity-rhea", "Rhea Moss"),
    },
];
