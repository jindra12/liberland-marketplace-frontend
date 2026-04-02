import * as React from "react";

import { Link } from "react-router-dom";

import { ShoppingCartOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";

import { useCartItems } from "./useCartItems";

type CartHeaderButtonProps = {
    className?: string;
};
export const CartHeaderButton: React.FunctionComponent<CartHeaderButtonProps> = (props) => {
    const { totalQuantity } = useCartItems();
    return (
        <Link to="/cart" aria-label="Cart" className="AppHeader__cartLink">
            <Badge count={totalQuantity} size="small" showZero>
                <Button className={props.className} type="text" icon={<ShoppingCartOutlined />} />
            </Badge>
        </Link>
    );
};
