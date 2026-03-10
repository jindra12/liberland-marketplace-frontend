import * as React from "react";
import { Button, Flex } from "antd";
import { Link } from "react-router-dom";
import { ProductServiceListInternal } from "./lists/ProductServiceListInternal";
import { useCartItems } from "./cart/useCartItems";

const Cart: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
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
                <Link to="/order" className="CartPage__orderLink">
                    <Button type="primary" size="large" block className="CartPage__orderButton">
                        Proceed to order
                    </Button>
                </Link>
            )}
        </Flex>
    );
};

export default Cart;
