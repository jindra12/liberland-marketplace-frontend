import * as React from "react";
import { Badge, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCartItems } from "./useCartItems";

type CartHeaderButtonProps = {
    className?: string;
};

export const CartHeaderButton: React.FunctionComponent<CartHeaderButtonProps> = ({ className }) => {
    const { totalQuantity } = useCartItems();

    return (
        <Link to="/cart" aria-label="Cart" className="AppHeader__cartLink">
            <Badge count={totalQuantity} size="small" showZero>
                <Button className={className} type="text" icon={<ShoppingCartOutlined />} />
            </Badge>
        </Link>
    );
};
