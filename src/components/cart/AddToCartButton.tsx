import * as React from "react";
import uniqBy from "lodash-es/uniqBy";
import objectHash from "object-hash";
import { ConfigProvider, Form, Space } from "antd";
import type { ButtonProps } from "antd";
import useLocalStorage from "use-local-storage";
import type { Cart, MeUserQuery } from "../../generated/graphql";
import { useCartBySecretQuery } from "../hooks";
import {
    CART_SECRETS_INDEX_KEY,
    CartSecretEntry,
} from "./cartSecrets";
import { useCartMutationContext } from "./CartMutationContext";
import { BuyNowButton } from "./BuyNowButton/BuyNowButton";
import { AddToCartIncrementForm } from "./AddToCartIncrementForm";

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

export const AddToCartButton: React.FunctionComponent<AddToCartButtonProps> = ({
    productId,
    variantId,
    serverURL,
    block,
    size = "large",
    maxAvailable,
    isAuthenticated,
    me,
}) => {
    const [form] = Form.useForm();
    const [cartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(() => (
        (cartSecrets || []).find((entry) => entry.url === serverURL)?.secret || ""
    ), [cartSecrets, serverURL]);
    const cartQuery = useCartBySecretQuery(
        { secret: cartSecret, url: serverURL },
        { enabled: Boolean(cartSecret) },
    );
    const { isMutating } = useCartMutationContext();
    const productKey = `${productId}::${variantId ?? ""}`;
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const currentItem = existingCart?.items?.find((item) => (
        `${item.product?.id ?? ""}::${item.variant?.id ?? ""}` === productKey
    ));
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const usesSplitLayout = !hasItemInCart;
    const compactClassName = [
        "AddToCartButton__compact",
        usesSplitLayout ? "AddToCartButton__compact--split" : "",
        block ? "AddToCartButton__compact--block" : "",
        hasItemInCart ? "AddToCartButton__compact--hasRemove" : "",
    ].filter(Boolean).join(" ");
    const watchedQuantity = Form.useWatch("quantity", form);
    const inputQuantity = typeof watchedQuantity === "number" && watchedQuantity > 0 ? watchedQuantity : 1;
    const remainingQuantity = typeof maxAvailable === "number"
        ? Math.max(0, maxAvailable - currentItemQuantity)
        : undefined;
    const shouldHideButton = remainingQuantity !== undefined && remainingQuantity <= 0;
    const buyNowQuantity = remainingQuantity !== undefined
        ? Math.min(inputQuantity, remainingQuantity)
        : inputQuantity;

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
            <Space.Compact block={block} className={compactClassName}>
                <AddToCartIncrementForm
                    form={form}
                    productId={productId}
                    serverURL={serverURL}
                    isAuthenticated={isAuthenticated}
                    maxAvailable={maxAvailable}
                    size={size}
                    variantId={variantId}
                />
                <BuyNowButton
                    block={block}
                    candidateProfileAddresses={uniqBy(me.filter(
                        (me) => me.meUser?.user?.shippingAddress && me.meUser.user.email
                    ).map(me => ({
                        ...me.meUser?.user?.shippingAddress!,
                        email: me.meUser?.user?.email!
                    })), objectHash)}
                    disabled={isMutating}
                    productId={productId}
                    quantity={buyNowQuantity}
                    serverURL={serverURL}
                    size={size}
                    variantId={variantId}
                />
            </Space.Compact>
        </ConfigProvider>
    );
};
