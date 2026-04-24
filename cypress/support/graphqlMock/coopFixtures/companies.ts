import { image, COOP_SYNDICATION_URL } from "../fixtures/shared";
import { identities } from "./identities";
import { meUser } from "./meUser";
import { Company__Status, Company_CryptoAddresses_Chain } from "../../../../src/generated/graphql";
import type { Company } from "../../../../src/generated/graphql";

export const companies: Company[] = [
    {
        id: "coop-company-helix-harbor",
        name: "Helix Harbor",
        description: "Cooperative logistics and export tools",
        website: "https://helix.example",
        phone: "+1 555 5100",
        email: "hello@helix.example",
        serverURL: COOP_SYNDICATION_URL,
        _status: Company__Status.Published,
        isSubscribed: true,
        createdBy: meUser.user,
        identity: identities[0],
        allowedIdentities: [identities[0], identities[2]],
        disallowedIdentities: [identities[1]],
        cryptoAddresses: { chain: Company_CryptoAddresses_Chain.Solana, address: "SoHelix510" },
        image: image("coop-company-helix-harbor", "Helix Harbor"),
    },
    {
        id: "coop-company-salt-works",
        name: "Salt Works",
        description: "Lightweight design and production",
        website: "https://salt.example",
        phone: "+1 555 5200",
        email: "team@salt.example",
        serverURL: COOP_SYNDICATION_URL,
        _status: Company__Status.Published,
        isSubscribed: false,
        createdBy: meUser.user,
        identity: identities[1],
        allowedIdentities: [identities[1]],
        disallowedIdentities: [identities[2]],
        cryptoAddresses: { chain: Company_CryptoAddresses_Chain.Ethereum, address: "0xSalt520" },
        image: image("coop-company-salt-works", "Salt Works"),
    },
    {
        id: "coop-company-harbor-ether",
        name: "Harbor Ether",
        description: "Co-op vendor with the shared Ethereum address",
        website: "https://harbor-ether.example",
        phone: "+1 555 5300",
        email: "team@harbor-ether.example",
        serverURL: COOP_SYNDICATION_URL,
        _status: Company__Status.Published,
        isSubscribed: true,
        createdBy: meUser.user,
        identity: identities[0],
        allowedIdentities: [identities[0]],
        disallowedIdentities: [identities[1]],
        cryptoAddresses: { chain: Company_CryptoAddresses_Chain.Ethereum, address: "0xHarbor111" },
        image: image("coop-company-harbor-ether", "Harbor Ether"),
    },
];
