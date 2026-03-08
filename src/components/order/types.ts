import type { CreateOrderMutation, MutationOrder_ShippingAddressInput } from "../../generated/graphql";

export type CreatedOrder = NonNullable<CreateOrderMutation["createOrder"]>;

export type SubmittedOrder = {
    url: string;
    order: CreatedOrder;
};

export type OrderFormValues = {
    customerEmail: string;
    shippingAddress: MutationOrder_ShippingAddressInput;
};
