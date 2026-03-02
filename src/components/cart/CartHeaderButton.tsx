import * as React from "react";
import { Badge, Button } from "antd";
import type { ButtonProps } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCartItems } from "./useCartItems";

type CartHeaderButtonProps = {
    onClick?: () => void;
    className?: string;
    buttonType?: ButtonProps["type"];
    block?: boolean;
    children?: React.ReactNode;
    inlineCount?: boolean;
};

export const CartHeaderButton: React.FunctionComponent<CartHeaderButtonProps> = ({
    onClick,
    className,
    buttonType = "text",
    block,
    children,
    inlineCount,
}) => {
    const { totalQuantity } = useCartItems();
    const content = inlineCount
        ? `${children || "Cart"} (${totalQuantity})`
        : children;

    const button = (
        <Button
            type={buttonType}
            block={block}
            icon={<ShoppingCartOutlined />}
            aria-label="Cart"
        >
            {content}
        </Button>
    );

    const node = inlineCount
        ? button
        : (
            <Badge count={totalQuantity} size="small" showZero>
                {button}
            </Badge>
        );

    return (
        <Link to="/cart" onClick={onClick} className={className}>
            {node}
        </Link>
    );
};
