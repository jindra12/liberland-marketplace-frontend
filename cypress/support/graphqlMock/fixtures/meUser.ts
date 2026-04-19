import type { MeUserQuery, User } from "../../../../src/generated/graphql";
import { User_Wallets_Chain } from "../../../../src/generated/graphql";

const user: User = {
    id: "user-nova",
    name: "Nova Rivers",
    email: "nova@example.test",
    emailVerified: true,
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
        { chain: User_Wallets_Chain.Solana, provider: "phantom", address: "SoUserWallet1717" },
        { chain: User_Wallets_Chain.Ethereum, provider: "metamask", address: "0xUserWallet1818" },
        { chain: User_Wallets_Chain.Tron, provider: "TronLink Stub", address: "TUserWallet1919" },
    ],
};

export const meUser = {
    user,
} satisfies NonNullable<MeUserQuery["meUser"]>;
