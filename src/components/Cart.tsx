import * as React from "react";

import { Flex } from "antd";

import { routes } from "../routes";

import { useCartItems } from "./cart/useCartItems";
import { ProductServiceListInternal } from "./lists/ProductServiceListInternal";
import { RouteButton } from "./RouteButton";

const Cart: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const { isLoading, products, refetch, totalQuantity } = useCartItems();

    return (
        <Flex vertical gap={24} className="CartPage">
            <ProductServiceListInternal
                source="static"
                page={page}
                setPage={setPage}
                products={products}
                isLoading={isLoading}
                hasNextPage={false}
                refetch={refetch}
                title="Cart"
                showOrderNowFallback={false}
            />
            {totalQuantity > 0 && (
                <RouteButton
                    to={routes.order.route}
                    type="primary"
                    size="large"
                    block
                    className="CartPage__orderLink CartPage__orderButton"
                >
                    Proceed to order
                </RouteButton>
            )}
        </Flex>
    );
};

export default Cart;
