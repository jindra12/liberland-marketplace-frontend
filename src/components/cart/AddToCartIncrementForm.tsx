import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Form, InputNumber, message } from "antd";
import type { ButtonProps, FormInstance } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import { useCartBySecretQuery, useCreateCartMutation, useUpdateCartMutation } from "../hooks";

import { AddToCartSubmitButton } from "./AddToCartSubmitButton";
import { useCartMutationContext } from "./CartMutationContext";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";
import { clampCartQuantity, getInitialCartQuantity, notifyCartSecretsChanged } from "./utils";

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
    const quantityInputTextRef = React.useRef("1");
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
    const maxAvailable =
        props.maxAvailable === null || props.maxAvailable === undefined ? undefined : props.maxAvailable;
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
    React.useEffect(() => {
        if (props.form.isFieldTouched("quantity")) {
            return;
        }

        const nextQuantity = getInitialCartQuantity(currentItemQuantity);
        if (props.form.getFieldValue("quantity") !== nextQuantity) {
            props.form.setFieldValue("quantity", nextQuantity);
        }
    }, [currentItemQuantity, props.form]);

    const persistQuantity = async (nextQuantityValue: number | null | undefined, rawInputValue: string | undefined) => {
        if (rawInputValue && rawInputValue.includes("-")) {
            props.form.setFieldValue("quantity", currentItemQuantity > 0 ? currentItemQuantity : 1);
            return;
        }

        if (rawInputValue === "") {
            props.form.setFieldValue("quantity", currentItemQuantity > 0 ? currentItemQuantity : 1);
            return;
        }

        const nextQuantity = clampCartQuantity(nextQuantityValue, maxAvailable);

        if (!hasItemInCart && nextQuantity <= 0) {
            props.form.setFieldValue("quantity", 1);
            return;
        }

        if (isMutating) {
            messageApi.info("Loading, please try again");
            return;
        }

        const normalizedQuantity = hasItemInCart ? nextQuantity : Math.max(1, nextQuantity);
        const quantityHasChanged = normalizedQuantity !== currentItemQuantity;

        if (!quantityHasChanged && nextQuantity > 0) {
            props.form.setFieldValue("quantity", normalizedQuantity);
            return;
        }

        setIsMutating(true);
        try {
            if (!existingCart?.id) {
                await addItemToNewCart(normalizedQuantity);
            } else {
                const itemsByKey = toItemsByKey(existingCart as Cart);
                const productItem = itemsByKey[productKey];

                if (normalizedQuantity <= 0) {
                    if (!productItem) {
                        props.form.setFieldValue("quantity", 1);
                        return;
                    }

                    delete itemsByKey[productKey];
                } else if (!productItem) {
                    itemsByKey[productKey] = {
                        product: props.productId,
                        variant: props.variantId,
                        quantity: normalizedQuantity,
                    };
                } else {
                    productItem.quantity = normalizedQuantity;
                }

                await updateExistingCartItems(existingCart as Cart, itemsByKey);
                await cartQuery.refetch();
                await queryClient.invalidateQueries({
                    queryKey: ["CartBySecret"],
                });
            }
            props.form.setFieldValue("quantity", normalizedQuantity > 0 ? normalizedQuantity : 1);
        } catch (error) {
            const errorMessage =
                error instanceof Error && error.message ? error.message : "Could not update cart quantity";
            messageApi.error(`Could not update cart quantity: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };
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
            const nextEntries = [
                ...(cartSecrets || []).filter((entry) => entry.url !== props.serverURL),
                {
                    url: props.serverURL,
                    secret: createdSecret,
                },
            ];
            setCartSecrets(nextEntries);
            notifyCartSecretsChanged(nextEntries);
            await queryClient.invalidateQueries({
                queryKey: ["CartBySecret"],
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
                items: Object.values(itemsByKey).filter((item) => (item.quantity ?? 0) > 0),
            },
        });
    };
    return (
        <Form
            component={false}
            className={formClassName}
            form={props.form}
            initialValues={{
                quantity: 1,
            }}
        >
            {messageContextHolder}
            {hasItemInCart ? (
                <Form.Item name="quantity" noStyle>
                    <InputNumber
                        min={0}
                        max={maxAvailable}
                        step={1}
                        precision={0}
                        size={size}
                        className={quantityInputClassName}
                        disabled={isMutating}
                        onInput={(value) => {
                            quantityInputTextRef.current = value;
                        }}
                        parser={(value) => {
                            const digits = (value || "").replace(/[^\d]/g, "");
                            return digits.length > 0 ? Number(digits) : 0;
                        }}
                        formatter={(value) => {
                            return value === null || value === undefined ? "" : String(value);
                        }}
                        onChange={(value) => {
                            props.form.setFieldValue("quantity", clampCartQuantity(value, maxAvailable));
                            persistQuantity(value, quantityInputTextRef.current);
                        }}
                    />
                </Form.Item>
            ) : (
                <AddToCartSubmitButton
                    disabled={isMutating}
                    loading={isMutating}
                    onClick={() => {
                        persistQuantity(1, "1");
                    }}
                    size={size}
                    ariaLabel="Add to cart"
                    icon={null}
                >
                    Add to cart
                </AddToCartSubmitButton>
            )}
        </Form>
    );
};
