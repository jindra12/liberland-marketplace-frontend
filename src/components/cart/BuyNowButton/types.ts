import type { MeUserQuery, MutationOrder_ShippingAddressInput } from "../../../generated/graphql";

export type AddressWithEmail = MutationOrder_ShippingAddressInput & {
    email: string;
}

export type BuyNowStoredShippingAddress = {
    key: string;
    shippingAddress: AddressWithEmail;
};

export type BuyNowSelectedAddressMap = Record<string, string>;

export type BuyNowShippingAddressSource = "profile" | "saved";

export type BuyNowUser = NonNullable<NonNullable<MeUserQuery["meUser"]>["user"]>;

export type BuyNowPreparedPurchase = {
    candidateProfileAddresses: AddressWithEmail[];
};
