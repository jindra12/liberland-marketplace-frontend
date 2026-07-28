import type { User } from "../../../../src/generated/graphql";

export const meUser: { user: User } = {
    user: {
        id: "guest-user-mira",
        name: "Mira Harbor",
        email: "mira@example.test",
        emailVerified: true,
        phone: "+1 555 7701",
        shippingAddress: null,
        wallets: [],
    },
};
