import * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ListProductsQuery } from "../generated/graphql";
import { ProductServiceListInternal } from "./lists/ProductServiceListInternal";
import { useCartItems } from "./cart/useCartItems";

const Cart: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const { isLoading, products, refetch } = useCartItems();

    const query = React.useMemo(() => ({
        data: {
            Products: {
                docs: products,
                hasNextPage: false,
            },
        },
        isLoading,
        refetch: async () => {
            await refetch();
            return undefined as unknown as any;
        },
    }) as UseQueryResult<ListProductsQuery, unknown>, [isLoading, products, refetch]);

    return (
        <ProductServiceListInternal
            page={page}
            setPage={setPage}
            query={query}
            title="Cart"
        />
    );
};

export default Cart;
