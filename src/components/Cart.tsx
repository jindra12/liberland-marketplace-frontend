import * as React from "react";
import { Button, Flex } from "antd";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { ListProductsQuery } from "../generated/graphql";
import { ProductServiceListInternal } from "./lists/ProductServiceListInternal";
import { useCartItems } from "./cart/useCartItems";

const Cart: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const { isLoading, products, refetch, totalQuantity } = useCartItems();

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
        <Flex vertical gap={16}>
            {totalQuantity > 0 && (
                <Flex justify="flex-end">
                    <Link to="/order">
                        <Button type="primary">Proceed to order</Button>
                    </Link>
                </Flex>
            )}
            <ProductServiceListInternal
                page={page}
                setPage={setPage}
                query={query}
                title="Cart"
            />
        </Flex>
    );
};

export default Cart;
