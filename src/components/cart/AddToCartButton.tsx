import * as React from "react";

import { ConfigProvider, Form, Space } from "antd";
import type { ButtonProps } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MeUserQuery } from "../../generated/graphql";
import { useCartBySecretQuery } from "../hooks";
import { buildProfileShippingAddresses } from "../order/utils";
import type { ProductParameterSource } from "../productParameters/types";

import { AddToCartIncrementForm } from "./AddToCartIncrementForm";
import { BuyNowButton } from "./BuyNowButton/BuyNowButton";
import { useCartMutationContext } from "./CartMutationContext";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";

type AddToCartButtonProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    hideBuyNowButton?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    me: MeUserQuery[];
    parameters?: ProductParameterSource[] | null;
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
    const parameterDefinitions = currentItem?.product?.parameters ?? props.parameters ?? [];
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const maxAvailable =
        typeof props.maxAvailable === "number" ? props.maxAvailable : undefined;
    const candidateProfileAddresses = React.useMemo(() => buildProfileShippingAddresses(props.me), [props.me]);
    const candidateProfileAddressesForBuyNow = props.isAuthenticated ? candidateProfileAddresses : [];
    const usesSplitLayout = !hasItemInCart;
    const compactClassName = [
        "AddToCartButton__compact",
        usesSplitLayout ? "AddToCartButton__compact--split" : "",
        props.block ? "AddToCartButton__compact--block" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const watchedQuantity = Form.useWatch("quantity", form);
    const inputQuantity =
        typeof watchedQuantity === "number" && watchedQuantity > 0
            ? watchedQuantity
            : currentItemQuantity > 0
              ? currentItemQuantity
              : 1;
    const shouldHideButton = maxAvailable !== undefined && maxAvailable <= 0 && !hasItemInCart;

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
                    maxAvailable={maxAvailable}
                    size={size}
                    variantId={props.variantId}
                    parameters={parameterDefinitions}
                />
                {props.hideBuyNowButton ? null : (
                    <BuyNowButton
                        block={props.block}
                        candidateProfileAddresses={candidateProfileAddressesForBuyNow}
                        disabled={isMutating}
                        form={form}
                        productId={props.productId}
                        quantity={inputQuantity}
                        serverURL={props.serverURL}
                        size={size}
                        variantId={props.variantId}
                        parameters={parameterDefinitions}
                    />
                )}
            </Space.Compact>
        </ConfigProvider>
    );
};
