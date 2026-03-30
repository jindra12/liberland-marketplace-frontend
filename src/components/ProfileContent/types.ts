import type {
    MeUserQuery,
    MutationUserUpdateInput,
    MutationUserUpdate_ShippingAddressInput,
} from "../../generated/graphql";

export type ProfileServerOption = {
    label: string;
    value: string;
};

export type NicknameFormValues = {
    name: string;
};

export type PasswordFormValues = {
    confirm: string;
    currentPassword: string;
    newPassword: string;
};

export type ProfileContactFormValues = {
    phone?: string | null;
    shippingAddress?: MutationUserUpdate_ShippingAddressInput;
};

export type ProfileSelectedUser = NonNullable<NonNullable<MeUserQuery["meUser"]>["user"]>;

export type ProfileContactUpdateInput = MutationUserUpdateInput;
