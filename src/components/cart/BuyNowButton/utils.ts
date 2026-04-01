import { AddressWithEmail } from "./types";

export const buildBuyNowShippingAddressHeadline = (shippingAddress: AddressWithEmail) => {
    const name = [shippingAddress.firstName, shippingAddress.lastName]
        .filter(Boolean)
        .join(" ");

    if (name) {
        return name;
    }

    if (shippingAddress.company) {
        return shippingAddress.company;
    }

    return shippingAddress.email;
};

export const buildBuyNowShippingAddressSummary = (shippingAddress: AddressWithEmail) => {
    return [
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postalCode,
        shippingAddress.country,
    ]
        .filter(Boolean)
        .join(", ");
};
