import * as React from "react";
import { Badge, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCartItems } from "./useCartItems";

export const CartHeaderButton: React.FunctionComponent = () => {
    const { totalQuantity } = useCartItems();

    return (
        <Link to="/cart" aria-label="Cart">
            <Badge count={totalQuantity} size="small" showZero>
                <Button type="text" icon={<ShoppingCartOutlined />} />
            </Badge>
        </Link>
    );
};
