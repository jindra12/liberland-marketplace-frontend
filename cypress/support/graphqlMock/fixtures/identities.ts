import { image, MAIN_SYNDICATION_URL } from "./shared";
import { meUser } from "./meUser";
import type { Identity } from "../../../../src/generated/graphql";

export const identities: Identity[] = [
    {
        id: "identity-nova",
        name: "Nova Rivers",
        description: "Harbor logistics lead",
        website: "https://nova.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        image: image("identity-nova", "Nova Rivers"),
    },
    {
        id: "identity-atlas",
        name: "Atlas Pike",
        description: "Product explorer",
        website: "https://atlas.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        image: image("identity-atlas", "Atlas Pike"),
    },
    {
        id: "identity-mira",
        name: "Mira Vale",
        description: "Community operator",
        website: "https://mira.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        image: image("identity-mira", "Mira Vale"),
    },
    {
        id: "identity-orion",
        name: "Orion Swift",
        description: "Shipwright",
        website: "https://orion.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        image: image("identity-orion", "Orion Swift"),
    },
    {
        id: "identity-sage",
        name: "Sage Bloom",
        description: "Independent maker",
        website: "https://sage.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        image: image("identity-sage", "Sage Bloom"),
    },
    {
        id: "identity-fourfold",
        name: "Fourfold Harbor",
        description: "Identity with four companies",
        website: "https://fourfold.example",
        createdBy: meUser.user!,
        serverURL: MAIN_SYNDICATION_URL,
        itemCount: 4,
        image: image("identity-fourfold", "Fourfold Harbor"),
    },
];
