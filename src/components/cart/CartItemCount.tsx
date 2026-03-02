import * as React from "react";
import { Tag } from "antd";
import useLocalStorage from "use-local-storage";
import { useCartBySecretQuery } from "../hooks";

type CartItemCountProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
};

export const CartItemCount: React.FunctionComponent<CartItemCountProps> = ({
    productId,
    variantId,
    serverURL,
}) => {
    const [cartSecret] = useLocalStorage<string>(`cart.secret.${serverURL}`, "");
    const cartQuery = useCartBySecretQuery(
        { secret: cartSecret, url: serverURL },
        { enabled: Boolean(cartSecret) },
    );

    const itemInCart = (cartQuery.data?.Carts?.docs?.[0]?.items || []).find((item) => (
        item.product?.id === productId && (item.variant?.id ?? "") === (variantId ?? "")
    ));
    const quantity = itemInCart?.quantity ?? 0;

    return <Tag color={quantity > 0 ? "blue" : "default"}>In cart: {quantity}</Tag>;
};
