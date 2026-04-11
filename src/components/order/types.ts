import type {
    CreateOrderMutation,
    MutationOrder_ShippingAddressInput,
    MutationOrderUpdate_TransactionHashesInput,
} from "../../generated/graphql";
import type { CryptoChain } from "../../types";

export type CreatedOrder = NonNullable<CreateOrderMutation["createOrder"]>;

export type AddressWithEmail = MutationOrder_ShippingAddressInput & {
    email: string;
    id: string;
};

export type SubmittedOrder = {
    url: string;
    order: CreatedOrder;
};

export type OrderFormValues = {
    customerEmail: string;
    shippingAddress: MutationOrder_ShippingAddressInput;
};

export type TransactionHashUpdateRow = MutationOrderUpdate_TransactionHashesInput;

export type SaveTransactionHashParams = {
    entry: SubmittedOrder;
    chain: CryptoChain;
    txHash: string;
};

export type PaymentWalletSelection = {
    address: string;
    chain: CryptoChain;
    provider: string;
};

export type PaymentProfileUser = {
    id: string;
    wallets: PaymentWalletSelection[];
};

export type PaymentProfileUsersByUrl = Record<string, PaymentProfileUser | undefined>;
