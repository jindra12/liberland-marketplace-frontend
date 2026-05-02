import { image, GUEST_SYNDICATION_URL } from "../fixtures/shared";
import { identities } from "./identities";
import { meUser } from "./meUser";
import { Company__Status, Company_CryptoAddresses_Chain, Company_Verification } from "../../../../src/generated/graphql";
import type { Company } from "../../../../src/generated/graphql";

export const companies: Company[] = [
    {
        id: "guest-company-harbor-craft",
        name: "Harbor Craft",
        description: "Guest storefront with a company wallet",
        website: "https://harbor-craft.example",
        phone: "+1 555 7700",
        email: "hello@harbor-craft.example",
        serverURL: GUEST_SYNDICATION_URL,
        verification: Company_Verification.PrivateSeller,
        _status: Company__Status.Published,
        isSubscribed: false,
        createdBy: meUser.user,
        identity: identities[0],
        allowedIdentities: [identities[0]],
        disallowedIdentities: [],
        cryptoAddresses: { chain: Company_CryptoAddresses_Chain.Ethereum, address: "0xGuestHarbor777" },
        image: image("guest-company-harbor-craft", "Harbor Craft"),
    },
];
