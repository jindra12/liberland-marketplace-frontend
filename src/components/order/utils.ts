import objectHash from "object-hash";
import uniqBy from "lodash-es/uniqBy";
import type { MeUserQuery, MutationOrder_ShippingAddressInput } from "../../generated/graphql";
import type { AddressWithEmail, OrderFormValues } from "./types";

type ProfileUser = NonNullable<NonNullable<MeUserQuery["meUser"]>["user"]>;

const toProfileUsers = (meUsers?: MeUserQuery | MeUserQuery[]): ProfileUser[] => {
    const entries = Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : [];

    return entries.flatMap((entry) => {
        return entry.meUser?.user ? [entry.meUser.user] : [];
    });
};

const inferNameParts = (fullName?: string) => {
    if (!fullName) {
        return {
            firstName: undefined,
            lastName: undefined,
        };
    }

    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ");
    return {
        firstName,
        lastName: lastName ? lastName : undefined,
    };
};

export const buildShippingAddressHeadline = (shippingAddress: AddressWithEmail): string => {
    const name = [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ");

    if (name) {
        return name;
    }

    if (shippingAddress.company) {
        return shippingAddress.company;
    }

    return shippingAddress.email;
};

export const buildShippingAddressSummary = (shippingAddress: AddressWithEmail): string => {
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

export const buildProfileShippingAddresses = (meUsers?: MeUserQuery | MeUserQuery[]): AddressWithEmail[] => {
    return uniqBy(
        toProfileUsers(meUsers).flatMap((user) => {
            if (!user.shippingAddress) {
                return [];
            }

            const shippingAddress = {
                ...user.shippingAddress,
                email: user.email,
            };

            return [
                {
                    ...shippingAddress,
                    id: objectHash(shippingAddress),
                },
            ];
        }),
        (address) => address.id,
    );
};

export const buildOrderPrefill = (meUsers?: MeUserQuery | MeUserQuery[]) => {
    const users = toProfileUsers(meUsers);
    const firstUser = users[0];
    const firstShippingAddress = users.find((user) => user.shippingAddress)?.shippingAddress;
    const inferredNames = inferNameParts(firstUser?.name);

    return {
        profileEmail: firstUser?.email,
        prefillFirstName: firstShippingAddress?.firstName ?? inferredNames.firstName,
        prefillLastName: firstShippingAddress?.lastName ?? inferredNames.lastName,
    };
};

export const toShippingAddressInput = (shippingAddress: AddressWithEmail): MutationOrder_ShippingAddressInput => {
    const { email: _email, id: _id, ...input } = shippingAddress;
    return input;
};

export const buildOrderFormValues = (props: {
    prefillFirstName?: string;
    prefillLastName?: string;
    profileEmail?: string;
    savedShippingAddress?: AddressWithEmail;
}): OrderFormValues => {
    if (props.savedShippingAddress) {
        return {
            customerEmail: props.savedShippingAddress.email,
            shippingAddress: toShippingAddressInput(props.savedShippingAddress),
        };
    }

    return {
        customerEmail: props.profileEmail ?? "",
        shippingAddress: {
            country: "United States",
            firstName: props.prefillFirstName,
            lastName: props.prefillLastName,
        },
    };
};
