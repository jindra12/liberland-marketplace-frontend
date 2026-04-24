import { image, GUEST_SYNDICATION_URL } from "../fixtures/shared";
import { meUser } from "./meUser";
import type { Identity } from "../../../../src/generated/graphql";

export const identities: Identity[] = [
    {
        id: "guest-identity-mira",
        name: "Mira Harbor",
        description: "Guest shopper",
        website: "https://mira.example",
        serverURL: GUEST_SYNDICATION_URL,
        createdBy: meUser.user,
        image: image("guest-identity-mira", "Mira Harbor"),
    },
];
