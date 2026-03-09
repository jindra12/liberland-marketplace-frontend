import * as React from "react";
import { Button, ConfigProvider, Form, InputNumber, Space, message } from "antd";
import { CloseOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import type { ButtonProps } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import useLocalStorage from "use-local-storage";
import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import { useCartBySecretQuery, useCreateCartMutation, useUpdateCartMutation } from "../hooks";
import {
    CART_SECRETS_INDEX_KEY,
    CartSecretEntry,
} from "./cartSecrets";

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
    const [isLoading, setIsLoading] = React.useState(false);
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
    const remainingQuantity = typeof maxAvailable === "number"
        ? Math.max(0, maxAvailable - currentItemQuantity)
        : undefined;

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

    const removeItemFromExistingCart = async (existingCart: Cart) => {
        const itemsByKey = toItemsByKey(existingCart);

        const productKey = `${productId}::${variantId ?? ""}`;
        delete itemsByKey[productKey];

        await updateExistingCartItems(existingCart, itemsByKey);
    };

    const handleFinish = async (values: { quantity?: number }) => {
        if (remainingQuantity !== undefined && remainingQuantity <= 0) {
            messageApi.info("No more inventory available");
            return;
        }

        const requestedQuantity = values.quantity && values.quantity > 0 ? values.quantity : 1;
        const quantity = remainingQuantity !== undefined
            ? Math.min(requestedQuantity, remainingQuantity)
            : requestedQuantity;

        try {
            setIsLoading(true);
            await addItemToCart(quantity);
            await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
            messageApi.success("Added to cart");
        } catch (error) {
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Could not add product to cart";
            messageApi.error(`Could not add product to cart: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        try {
            setIsLoading(true);
            if (!existingCart?.id) {
                messageApi.info("Item is not in cart");
                return;
            }

            await removeItemFromExistingCart(existingCart as Cart);
            await cartQuery.refetch();
            await queryClient.invalidateQueries({ queryKey: ["CartBySecret"] });
            messageApi.success("Removed from cart");
        } catch (error) {
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Could not remove product from cart";
            messageApi.error(`Could not remove product from cart: ${errorMessage}`);
        } finally {
            setIsLoading(false);
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
            <Form form={form} onFinish={handleFinish} initialValues={{ quantity: 1 }}>
                <Space.Compact block={block}>
                    <Form.Item name="quantity" noStyle>
                        <InputNumber
                            min={1}
                            max={remainingQuantity}
                            step={1}
                            precision={0}
                            size={size}
                            className={quantityInputClassName}
                            disabled={remainingQuantity !== undefined && remainingQuantity <= 0}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        size={size}
                        icon={<ShoppingCartOutlined />}
                        htmlType="submit"
                        loading={isLoading}
                        disabled={remainingQuantity !== undefined && remainingQuantity <= 0}
                    >
                        Buy
                    </Button>
                    {hasItemInCart && (
                        <Button
                            size={size}
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleRemove}
                            loading={isLoading}
                        />
                    )}
                </Space.Compact>
            </Form>
        </ConfigProvider>
    );
};
