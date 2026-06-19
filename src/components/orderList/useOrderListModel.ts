import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useSellerOrderProductsQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";

import { ORDER_LIST_PAGE_SIZE } from "./constants";

export const useOrderListModel = () => {
    const auth = useAuth();
    const [page, setPage] = React.useState(1);
    const query = useSellerOrderProductsQuery(
        {
            limit: ORDER_LIST_PAGE_SIZE,
            page,
        },
        {
            enabled: auth.isAuthenticated,
        },
    );
    const items = useAccumulatedDocs(query.data?.sellerOrderProducts.docs, page);

    return {
        emptyText: auth.isAuthenticated ? "No seller orders yet." : "Log in to see seller orders.",
        hasMore: Boolean(query.data?.sellerOrderProducts.hasNextPage),
        items,
        loading: query.isLoading,
        next: () => {
            setPage(page + 1);
        },
        refetch: query.refetch,
    };
};
