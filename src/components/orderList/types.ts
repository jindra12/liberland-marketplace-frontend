import type { SellerOrderProductsQuery } from "../../generated/graphql";

export type SellerOrderProduct = NonNullable<NonNullable<SellerOrderProductsQuery["sellerOrderProducts"]>["docs"]>[number] & { serverURL?: string };
export type OrderListItemActionsProps = {
    order: SellerOrderProduct;
    onChanged: () => Promise<unknown>;
};
