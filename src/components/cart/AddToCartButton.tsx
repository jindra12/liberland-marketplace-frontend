import * as React from "react";
import { Button, ConfigProvider, Form, InputNumber, Space, message } from "antd";
import { CloseOutlined, MinusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import type { ButtonProps } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import useLocalStorage from "use-local-storage";
import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import { useCartBySecretQuery, useCreateCartMutation, useUpdateCartMutation } from "../hooks";
import {
    CART_SECRETS_INDEX_KEY,
    CartSecretEntry,
} from "./cartSecrets";
import { useCartMutationContext } from "./CartMutationContext";

type AddToCartButtonProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
};

export const AddToCartButton: React.FunctionComponent<AddToCartButtonProps> = ({
    productId,
    variantId,
    serverURL,
    block,
    size = "large",
    maxAvailable,
}) => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [cartSecrets, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(() => (
        (cartSecrets || []).find((entry) => entry.url === serverURL)?.secret || ""
    ), [cartSecrets, serverURL]);
    const cartQuery = useCartBySecretQuery(
        { secret: cartSecret, url: serverURL },
        { enabled: Boolean(cartSecret) },
    );
    const createCart = useCreateCartMutation();
    const updateCart = useUpdateCartMutation();
    const { isMutating, setIsMutating } = useCartMutationContext();
    const quantityInputClassName = [
        "AddToCartButton__quantity",
        size === "small" ? "AddToCartButton__quantity--small" : "AddToCartButton__quantity--default",
    ].join(" ");
    const productKey = `${productId}::${variantId ?? ""}`;
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const currentItem = existingCart?.items?.find((item) => (
        `${item.product?.id ?? ""}::${item.variant?.id ?? ""}` === productKey
    ));
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const usesSplitLayout = !hasItemInCart;
    const formClassName = [
        "AddToCartButton",
        usesSplitLayout ? "AddToCartButton--split" : "",
    ].filter(Boolean).join(" ");
    const compactClassName = [
        "AddToCartButton__compact",
        usesSplitLayout ? "AddToCartButton__compact--split" : "",
        block ? "AddToCartButton__compact--block" : "",
        hasItemInCart ? "AddToCartButton__compact--hasRemove" : "",
    ].filter(Boolean).join(" ");
    const watchedQuantity = Form.useWatch("quantity", form);
    const inputQuantity = typeof watchedQuantity === "number" && watchedQuantity > 0 ? watchedQuantity : 1;
    const shouldRemovePartially = hasItemInCart && inputQuantity < currentItemQuantity;
    const remainingQuantity = typeof maxAvailable === "number"
        ? Math.max(0, maxAvailable - currentItemQuantity)
        : undefined;
    const shouldHideButton = remainingQuantity !== undefined && remainingQuantity <= 0;

    if (shouldHideButton) {
        return null;
    }

    const addItemToNewCart = async (quantity: number) => {
        const result = await createCart.mutateAsync({
            url: serverURL,
            draft: false,
            data: {
                items: [
                    {
                        product: productId,
                        variant: variantId,
                        quantity,
                    },
                ],
            },
        });

        const createdSecret = result.createCart?.secret;
        if (createdSecret) {
            setCartSecrets((prev) => {
                const filtered = (prev || []).filter((entry) => entry.url !== serverURL);
                return [...filtered, { url: serverURL, secret: createdSecret }];
            });
        }
    };

    const toItemsByKey = (existingCart: Cart): Record<string, MutationCartUpdate_ItemsInput> => {
        const existingItems = existingCart.items || [];
        return Object.fromEntries(
            existingItems.map((item) => {
                const mutationItem: MutationCartUpdate_ItemsInput = {
                    quantity: item.quantity ?? 1,
                };
                mutationItem.id = item.id!;
                mutationItem.product = item.product?.id;
                mutationItem.variant = item.variant?.id;
                return [`${item.product?.id ?? ""}::${item.variant?.id ?? ""}`, mutationItem];
            }),
        );
    };

    const updateExistingCartItems = async (
        existingCart: Cart,
        itemsByKey: Record<string, MutationCartUpdate_ItemsInput>,
    ) => {
        await updateCart.mutateAsync({
            url: serverURL,
            id: existingCart.id,
            draft: false,
            data: {
                items: Object.values(itemsByKey),
            },
        });
    };

    const addItemToExistingCart = async (existingCart: Cart, quantity: number) => {
        const itemsByKey = toItemsByKey(existingCart);

        const productKey = `${productId}::${variantId ?? ""}`;
        const productItem = (itemsByKey[productKey] ||= {
            product: productId,
            variant: variantId,
            quantity: 0,
        });
        productItem.quantity += quantity;

        await updateExistingCartItems(existingCart, itemsByKey);
    };

    const addItemToCart = async (quantity: number) => {
        if (!existingCart?.id) {
            await addItemToNewCart(quantity);
        } else {
            await addItemToExistingCart(existingCart as Cart, quantity);
        }
        await cartQuery.refetch();
    };

    const removeItemFromExistingCart = async (existingCart: Cart, quantityToRemove: number) => {
        const itemsByKey = toItemsByKey(existingCart);

        const productKey = `${productId}::${variantId ?? ""}`;
        const cartItem = itemsByKey[productKey];
        const currentQuantity = cartItem?.quantity ?? 0;

        if (!cartItem || currentQuantity <= 0) {
            return;
        }

        if (quantityToRemove >= currentQuantity) {
            delete itemsByKey[productKey];
        } else {
            cartItem.quantity = currentQuantity - quantityToRemove;
        }

        await updateExistingCartItems(existingCart, itemsByKey);
    };

    const handleFinish = async (values: { quantity?: number }) => {
        if (isMutating) {
            return;
        }

        if (remainingQuantity !== undefined && remainingQuantity <= 0) {
            messageApi.info("No more inventory available");
            return;
        }

        const requestedQuantity = values.quantity && values.quantity > 0 ? values.quantity : 1;
        const quantity = remainingQuantity !== undefined
            ? Math.min(requestedQuantity, remainingQuantity)
            : requestedQuantity;

        setIsMutating(true);
        try {
            await addItemToCart(quantity);
            await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
            messageApi.success("Added to cart");
        } catch (error) {
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Could not add product to cart";
            messageApi.error(`Could not add product to cart: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };

    const handleRemove = async () => {
        if (isMutating) {
            return;
        }

        if (!existingCart?.id) {
            messageApi.info("Item is not in cart");
            return;
        }

        setIsMutating(true);
        try {
            const quantityToRemove = shouldRemovePartially ? inputQuantity : currentItemQuantity;
            await removeItemFromExistingCart(existingCart as Cart, quantityToRemove);
            await cartQuery.refetch();
            await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
            messageApi.success("Removed from cart");
        } catch (error) {
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Could not remove product from cart";
            messageApi.error(`Could not remove product from cart: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };

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
            {messageContextHolder}
            <Form className={formClassName} form={form} onFinish={handleFinish} initialValues={{ quantity: 1 }}>
                <Space.Compact block={block} className={compactClassName}>
                    <Form.Item name="quantity" noStyle>
                        <InputNumber
                            min={1}
                            max={remainingQuantity}
                            step={1}
                            precision={0}
                            size={size}
                            className={quantityInputClassName}
                            disabled={isMutating}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        size={size}
                        icon={<ShoppingCartOutlined />}
                        htmlType="submit"
                        loading={isMutating}
                        disabled={isMutating}
                    >
                        Buy
                    </Button>
                    {hasItemInCart && (
                        <Button
                            size={size}
                            danger
                            icon={shouldRemovePartially ? <MinusOutlined /> : <CloseOutlined />}
                            onClick={handleRemove}
                            loading={isMutating}
                            disabled={isMutating}
                        />
                    )}
                </Space.Compact>
            </Form>
        </ConfigProvider>
    );
};
