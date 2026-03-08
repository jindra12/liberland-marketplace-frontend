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

export const CartItemCount: React.FunctionComponent<CartItemCountProps> = ({
    productId,
    variantId,
    serverURL,
    hideWhenZero = false,
}) => {
    const [cartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(() => (
        (cartSecrets || []).find((entry) => entry.url === serverURL)?.secret || ""
    ), [cartSecrets, serverURL]);
    const cartQuery = useCartBySecretQuery(
        { secret: cartSecret, url: serverURL },
        { enabled: Boolean(cartSecret) },
    );

    const itemInCart = (cartQuery.data?.Carts?.docs?.[0]?.items || []).find((item) => (
        item.product?.id === productId && (item.variant?.id ?? "") === (variantId ?? "")
    ));
    const quantity = itemInCart?.quantity ?? 0;

    if (hideWhenZero && quantity <= 0) {
        return null;
    }

    return <Tag color={quantity > 0 ? "blue" : "default"}>In cart: {quantity}</Tag>;
};
