import type { MutationOrder_ShippingAddressInput } from "../../../generated/graphql";

export const BUY_NOW_SAVED_ADDRESSES_KEY_PREFIX = "buyNow.savedShippingAddresses";
export const BUY_NOW_MAX_SAVED_ADDRESSES = 8;

export const BUY_NOW_REQUIRED_SHIPPING_FIELDS: ReadonlyArray<keyof MutationOrder_ShippingAddressInput> = [
    "firstName",
    "lastName",
    "addressLine1",
    "city",
    "postalCode",
    "country",
];
