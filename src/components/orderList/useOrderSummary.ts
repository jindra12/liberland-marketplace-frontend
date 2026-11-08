import { useSellerOrderProductsQuery } from "../hooks";
import { useEndpointContext } from "../EndpointContext";

type UseOrderSummaryResult = {
    hasOrders: boolean;
    pendingCount: number;
};

export const useOrderSummary = (enabled: boolean): UseOrderSummaryResult => {
    const { authUrl } = useEndpointContext();
    const allOrdersQuery = useSellerOrderProductsQuery(
        {
            limit: 1,
            page: 1,
            url: authUrl,
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
            url: authUrl,
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
