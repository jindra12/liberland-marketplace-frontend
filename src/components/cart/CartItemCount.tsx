import * as React from "react";
import { Tag } from "antd";
import useLocalStorage from "use-local-storage";
import { useCartBySecretQuery } from "../hooks";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";
type CartItemCountProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    hideWhenZero?: boolean;
};
export const CartItemCount: React.FunctionComponent<CartItemCountProps> = (props) => {
    const hideWhenZero = props.hideWhenZero === undefined ? true : props.hideWhenZero;
    const [cartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(() => (cartSecrets || []).find((entry) => entry.url === props.serverURL)?.secret || "", [cartSecrets, props.serverURL]);
    const cartQuery = useCartBySecretQuery(
        {
            secret: cartSecret,
            url: props.serverURL,
        },
        {
            enabled: Boolean(cartSecret),
        },
    );
    const itemInCart = (cartQuery.data?.Carts?.docs?.[0]?.items || []).find((item) => item.product?.id === props.productId && (item.variant?.id ?? "") === (props.variantId ?? ""));
    const quantity = itemInCart?.quantity ?? 0;
    if (hideWhenZero && quantity <= 0) {
        return null;
    }
    return <Tag color={quantity > 0 ? "blue" : "default"}>In cart: {quantity}</Tag>;
};
