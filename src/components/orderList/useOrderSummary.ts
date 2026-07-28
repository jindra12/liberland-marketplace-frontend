import { useSellerOrderProductsQuery } from "../../generated/graphql";

type UseOrderSummaryResult = {
    hasOrders: boolean;
    pendingCount: number;
};

export const useOrderSummary = (enabled: boolean): UseOrderSummaryResult => {
    const allOrdersQuery = useSellerOrderProductsQuery(
        {
            limit: 1,
            page: 1,
        },
        {
            enabled,
        },
    );
    const pendingOrdersQuery = useSellerOrderProductsQuery(
        {
            fulfilled: false,
            limit: 1,
            page: 1,
            rejected: false,
        },
        {
            enabled,
        },
    );

    return {
        hasOrders: Boolean(allOrdersQuery.data?.sellerOrderProducts.totalDocs),
        pendingCount: pendingOrdersQuery.data?.sellerOrderProducts.totalDocs ?? 0,
    };
};
