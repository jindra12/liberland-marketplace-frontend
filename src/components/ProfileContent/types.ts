import type { MeUserQuery, MutationUserUpdateInput, MutationUserUpdate_ShippingAddressInput, UserUpdate_Wallets_Chain_MutationInput } from "../../generated/graphql";

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
    wallets?: ProfileWalletFormValue[];
};

export type ProfileSelectedUser = NonNullable<NonNullable<MeUserQuery["meUser"]>["user"]>;

export type ProfileContactUpdateInput = MutationUserUpdateInput;

export type ProfileWalletFormValue = {
    address?: string | null;
    chain?: UserUpdate_Wallets_Chain_MutationInput | null;
    provider?: string | null;
};

export type ProfileWalletSelection = {
    address: string;
    provider: string;
};

export type ProfileWalletSelectionTarget = {
    name: number;
} | null;
