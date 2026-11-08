import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useSellerOrderProductsQuery } from "../hooks";
import { useEndpointContext } from "../EndpointContext";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";

import { ORDER_LIST_PAGE_SIZE } from "./constants";

export const useOrderListModel = () => {
    const auth = useAuth();
    const { authUrl } = useEndpointContext();
    const [cursor, setCursor] = React.useState({ serverURL: authUrl, page: 1 });
    const page = cursor.serverURL === authUrl ? cursor.page : 1;
    if (cursor.serverURL !== authUrl) {
        setCursor({ serverURL: authUrl, page: 1 });
    }
    const query = useSellerOrderProductsQuery(
        {
            limit: ORDER_LIST_PAGE_SIZE,
            page,
            url: authUrl,
        },
        {
            enabled: auth.isAuthenticated,
        },
    );
    const items = useAccumulatedDocs(query.data?.sellerOrderProducts.docs.map((order) => ({ ...order, serverURL: authUrl })), page);

    return {
        emptyText: auth.isAuthenticated ? "No seller orders yet." : "Log in to see seller orders.",
        hasMore: Boolean(query.data?.sellerOrderProducts.hasNextPage),
        items,
        loading: query.isLoading,
        next: () => {
            setCursor({ serverURL: authUrl, page: page + 1 });
        },
        refetch: query.refetch,
    };
};
