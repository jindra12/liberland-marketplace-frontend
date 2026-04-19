import type { MeUserQuery } from "../../../../src/generated/graphql";

export const meUser: NonNullable<MeUserQuery["meUser"]> = {
    user: {
        id: "user-nova",
        name: "Nova Rivers",
        email: "nova@example.test",
        phone: "+1 555 0001",
        shippingAddress: {
            title: "Home",
            firstName: "Nova",
            lastName: "Rivers",
            company: "Harbor Labs",
            addressLine1: "1 Dockside Road",
            addressLine2: "Apt 12",
            city: "Port Sol",
            state: "Coast",
            postalCode: "11001",
            country: "Liberland",
            phone: "+1 555 0002",
        },
        wallets: [
            { chain: "solana", provider: "phantom", address: "SoUserWallet1717" },
            { chain: "ethereum", provider: "metamask", address: "0xUserWallet1818" },
            { chain: "tron", provider: "TronLink Stub", address: "TUserWallet1919" },
        ],
    },
};
