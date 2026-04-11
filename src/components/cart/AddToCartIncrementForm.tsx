import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { CloseOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, message } from "antd";
import type { ButtonProps, FormInstance } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import { useCartBySecretQuery, useCreateCartMutation, useUpdateCartMutation } from "../hooks";

import { AddToCartSubmitButton } from "./AddToCartSubmitButton";
import { useCartMutationContext } from "./CartMutationContext";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";

type AddToCartIncrementFormProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    form: FormInstance;
};
export const AddToCartIncrementForm: React.FunctionComponent<AddToCartIncrementFormProps> = (props) => {
    const size = props.size === undefined ? "large" : props.size;
    const queryClient = useQueryClient();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [cartSecrets, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
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
    const createCart = useCreateCartMutation();
    const updateCart = useUpdateCartMutation();
    const { isMutating, setIsMutating } = useCartMutationContext();
    const quantityInputClassName = [
        "AddToCartButton__quantity",
        size === "small" ? "AddToCartButton__quantity--small" : "AddToCartButton__quantity--default",
    ].join(" ");
    const productKey = `${props.productId}::${props.variantId ?? ""}`;
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const currentItem = existingCart?.items?.find(
        (item) => `${item.product?.id ?? ""}::${item.variant?.id ?? ""}` === productKey,
    );
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const usesSplitLayout = !hasItemInCart;
    const formClassName = ["AddToCartButton", usesSplitLayout ? "AddToCartButton--split" : ""]
        .filter(Boolean)
        .join(" ");
    const watchedQuantity = Form.useWatch("quantity", props.form);
    const inputQuantity = typeof watchedQuantity === "number" && watchedQuantity > 0 ? watchedQuantity : 1;
    const shouldRemovePartially = hasItemInCart && inputQuantity < currentItemQuantity;
    const remainingQuantity =
        typeof props.maxAvailable === "number" ? Math.max(0, props.maxAvailable - currentItemQuantity) : undefined;
    const addItemToNewCart = async (quantity: number) => {
        const result = await createCart.mutateAsync({
            url: props.serverURL,
            draft: false,
            data: {
                items: [
                    {
                        product: props.productId,
                        variant: props.variantId,
                        quantity,
                    },
                ],
            },
        });
        const createdSecret = result.createCart?.secret;
        if (createdSecret) {
            setCartSecrets((prev) => {
                const filtered = (prev || []).filter((entry) => entry.url !== props.serverURL);
                return [
                    ...filtered,
                    {
                        url: props.serverURL,
                        secret: createdSecret,
                    },
                ];
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
            url: props.serverURL,
            id: existingCart.id,
            draft: false,
            data: {
                items: Object.values(itemsByKey),
            },
        });
    };
    const addItemToExistingCart = async (existingCart: Cart, quantity: number) => {
        const itemsByKey = toItemsByKey(existingCart);
        const productKey = `${props.productId}::${props.variantId ?? ""}`;
        const productItem = (itemsByKey[productKey] ||= {
            product: props.productId,
            variant: props.variantId,
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
        const productKey = `${props.productId}::${props.variantId ?? ""}`;
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
        const quantity =
            remainingQuantity !== undefined ? Math.min(requestedQuantity, remainingQuantity) : requestedQuantity;
        setIsMutating(true);
        try {
            await addItemToCart(quantity);
            await queryClient.invalidateQueries({
                queryKey: ["CartBySecret"],
            });
            messageApi.success("Added to cart");
        } catch (error) {
            const errorMessage =
                error instanceof Error && error.message ? error.message : "Could not add product to cart";
            messageApi.error(`Could not add product to cart: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };
    const handleRemove = async () => {
        if (isMutating) {
            return;
        }
        setIsMutating(true);
        try {
            const quantityToRemove = shouldRemovePartially ? inputQuantity : currentItemQuantity;
            await removeItemFromExistingCart(existingCart as Cart, quantityToRemove);
            await cartQuery.refetch();
            await queryClient.invalidateQueries({
                queryKey: ["CartBySecret"],
            });
            messageApi.success("Removed from cart");
        } catch (error) {
            const errorMessage =
                error instanceof Error && error.message ? error.message : "Could not remove product from cart";
            messageApi.error(`Could not remove product from cart: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };
    return (
        <Form
            component={false}
            className={formClassName}
            form={props.form}
            onFinish={handleFinish}
            initialValues={{
                quantity: 1,
            }}
        >
            {messageContextHolder}
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
            <AddToCartSubmitButton
                size={size}
                loading={isMutating}
                disabled={isMutating}
                ariaLabel="Add to cart"
                icon={<PlusOutlined />}
            />
            {hasItemInCart && (
                <Button
                    size={size}
                    danger
                    aria-label="Remove"
                    icon={shouldRemovePartially ? <MinusOutlined /> : <CloseOutlined />}
                    onClick={handleRemove}
                    loading={isMutating}
                    disabled={isMutating}
                />
            )}
        </Form>
    );
};
