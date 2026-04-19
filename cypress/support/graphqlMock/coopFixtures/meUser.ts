import { User_Wallets_Chain } from "../../../../src/generated/graphql";
import type { User } from "../../../../src/generated/graphql";

export const meUser: { user: User } = {
    user: {
        id: "coop-user-iris",
        name: "Iris Shore",
        email: "iris@example.test",
        emailVerified: true,
        phone: "+1 555 0600",
        shippingAddress: {
            title: "Depot",
            firstName: "Iris",
            lastName: "Shore",
            company: "Helix Harbor",
            addressLine1: "8 Dockside Lane",
            addressLine2: "Unit 3",
            city: "North Port",
            state: "Coast",
            postalCode: "22001",
            country: "Liberland",
            phone: "+1 555 0601",
        },
        wallets: [{ chain: User_Wallets_Chain.Solana, provider: "phantom", address: "SoCoopWallet606" }],
    },
};
