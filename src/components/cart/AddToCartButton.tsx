import * as React from "react";

import { ConfigProvider, Form, Space } from "antd";
import type { ButtonProps } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MeUserQuery } from "../../generated/graphql";
import { useCartBySecretQuery } from "../hooks";
import { buildProfileShippingAddresses } from "../order/utils";

import { AddToCartIncrementForm } from "./AddToCartIncrementForm";
import { BuyNowButton } from "./BuyNowButton/BuyNowButton";
import { useCartMutationContext } from "./CartMutationContext";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";

type AddToCartButtonProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    me: MeUserQuery[];
};
export const AddToCartButton: React.FunctionComponent<AddToCartButtonProps> = (props) => {
    const size = props.size === undefined ? "large" : props.size;
    const [form] = Form.useForm();
    const [cartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(
        () => (cartSecrets || []).find((entry) => entry.url === props.serverURL)?.secret || "",
        [cartSecrets, props.serverURL],
    );
    const cartQuery = useCartBySecretQuery(
        {
            secret: cartSecret,
            url: props.serverURL,
        },
        {
            enabled: Boolean(cartSecret),
        },
    );
    const { isMutating } = useCartMutationContext();
    const productKey = `${props.productId}::${props.variantId ?? ""}`;
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const currentItem = existingCart?.items?.find(
        (item) => `${item.product?.id ?? ""}::${item.variant?.id ?? ""}` === productKey,
    );
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const candidateProfileAddresses = React.useMemo(() => buildProfileShippingAddresses(props.me), [props.me]);
    const candidateProfileAddressesForBuyNow = props.isAuthenticated === true ? candidateProfileAddresses : [];
    const usesSplitLayout = !hasItemInCart;
    const compactClassName = [
        "AddToCartButton__compact",
        usesSplitLayout ? "AddToCartButton__compact--split" : "",
        props.block ? "AddToCartButton__compact--block" : "",
        hasItemInCart ? "AddToCartButton__compact--hasRemove" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const watchedQuantity = Form.useWatch("quantity", form);
    const inputQuantity = watchedQuantity || 0;
    const remainingQuantity =
        typeof props.maxAvailable === "number" ? Math.max(0, props.maxAvailable - currentItemQuantity) : undefined;
    const shouldHideButton = remainingQuantity !== undefined && remainingQuantity <= 0;
    if (shouldHideButton) {
        return null;
    }
    return (
        <ConfigProvider
            theme={{
                components: {
                    InputNumber: {
                        handleVisible: true,
                    },
                },
            }}
        >
            <Space.Compact block={props.block} className={compactClassName}>
                <AddToCartIncrementForm
                    form={form}
                    productId={props.productId}
                    serverURL={props.serverURL}
                    isAuthenticated={props.isAuthenticated}
                    maxAvailable={props.maxAvailable}
                    size={size}
                    variantId={props.variantId}
                />
                <BuyNowButton
                    block={props.block}
                    candidateProfileAddresses={candidateProfileAddressesForBuyNow}
                    disabled={isMutating}
                    productId={props.productId}
                    quantity={inputQuantity}
                    serverURL={props.serverURL}
                    size={size}
                    variantId={props.variantId}
                />
            </Space.Compact>
        </ConfigProvider>
    );
};
