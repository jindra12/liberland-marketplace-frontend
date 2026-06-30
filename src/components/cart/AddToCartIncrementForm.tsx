import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Form, InputNumber, message } from "antd";
import type { ButtonProps, FormInstance } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import { useCartBySecretQuery, useCreateCartMutation, useUpdateCartMutation } from "../hooks";
import { ProductParameterSelectionFieldList } from "../productParameters/ProductParameterSelectionFieldList";
import type { ProductParameterSelectionMap, ProductParameterSource } from "../productParameters/types";
import {
    buildProductParameterFormValues,
    buildProductParameterSelectionMap,
    buildProductParameterSelectionMapFromFormValues,
    buildSelectedProductParametersInput,
} from "../productParameters/utils";

import { AddToCartSubmitButton } from "./AddToCartSubmitButton";
import { useCartMutationContext } from "./CartMutationContext";
import { CART_SECRETS_INDEX_KEY, CartSecretEntry } from "./cartSecrets";
import { clampCartQuantity, getInitialCartQuantity, notifyCartSecretsChanged } from "./utils";

const areProductParameterSelectionMapsEqual = (
    first: ProductParameterSelectionMap,
    second: ProductParameterSelectionMap,
) => {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    return firstKeys.every((key) => first[key] === second[key]);
};

type AddToCartIncrementFormProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    form: FormInstance;
    parameters?: ProductParameterSource[] | null;
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
    const maxAvailable =
        props.maxAvailable === null || props.maxAvailable === undefined ? undefined : props.maxAvailable;
    const productKey = `${props.productId}::${props.variantId ?? ""}`;
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const currentItem = existingCart?.items?.find(
        (item) => `${item.product?.id ?? ""}::${item.variant?.id ?? ""}` === productKey,
    );
    const parameterDefinitions = currentItem?.product?.parameters ?? props.parameters ?? [];
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const currentItemSelectedParameterKeys = buildProductParameterSelectionMap(currentItem?.parameters);
    const [quantityText, setQuantityText] = React.useState(() => String(getInitialCartQuantity(currentItemQuantity)));
    const hasItemInCart = currentItemQuantity > 0;
    const usesSplitLayout = !hasItemInCart;
    const formClassName = ["AddToCartButton", usesSplitLayout ? "AddToCartButton--split" : ""]
        .filter(Boolean)
        .join(" ");
    React.useEffect(() => {
        setQuantityText(String(getInitialCartQuantity(currentItemQuantity)));
    }, [currentItemQuantity]);

    const resetQuantityDraft = (nextQuantity: number) => {
        setQuantityText(String(nextQuantity > 0 ? nextQuantity : 1));
    };

    const persistQuantity = async (nextQuantityValue: number | null | undefined) => {
        const nextQuantity = clampCartQuantity(nextQuantityValue, maxAvailable);
        const selectedParameterKeys = buildProductParameterSelectionMapFromFormValues(
            props.form.getFieldValue("parameters"),
        );

        if (!hasItemInCart && nextQuantity <= 0) {
            resetQuantityDraft(1);
            return;
        }

        if (isMutating) {
            messageApi.info("Loading, please try again");
            return;
        }

        const normalizedQuantity = hasItemInCart ? nextQuantity : Math.max(1, nextQuantity);
        const quantityHasChanged = normalizedQuantity !== currentItemQuantity;
        const selectedParametersChanged = !areProductParameterSelectionMapsEqual(
            currentItemSelectedParameterKeys,
            selectedParameterKeys,
        );

        if (!quantityHasChanged && !selectedParametersChanged && nextQuantity > 0) {
            resetQuantityDraft(normalizedQuantity);
            return;
        }

        setIsMutating(true);
        try {
            if (!existingCart?.id) {
                await addItemToNewCart(normalizedQuantity, selectedParameterKeys);
            } else {
                const itemsByKey = toItemsByKey(existingCart as Cart);
                const productItem = itemsByKey[productKey];
                const selectedParametersInput = buildSelectedProductParametersInput(
                    parameterDefinitions,
                    selectedParameterKeys,
                );

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
                        ...(selectedParametersInput !== undefined && {
                            parameters: selectedParametersInput,
                        }),
                    };
                } else {
                    productItem.quantity = normalizedQuantity;
                    if (selectedParametersInput !== undefined) {
                        productItem.parameters = selectedParametersInput;
                    }
                }

                await updateExistingCartItems(existingCart as Cart, itemsByKey);
                await cartQuery.refetch();
                await queryClient.invalidateQueries({
                    queryKey: ["CartBySecret"],
                });
            }
            resetQuantityDraft(normalizedQuantity);
        } catch (error) {
            const errorMessage =
                error instanceof Error && error.message ? error.message : "Could not update cart quantity";
            messageApi.error(`Could not update cart quantity: ${errorMessage}`);
        } finally {
            setIsMutating(false);
        }
    };
    const addItemToNewCart = async (quantity: number, selectedParameterKeys: ProductParameterSelectionMap) => {
        const selectedParametersInput = buildSelectedProductParametersInput(
            parameterDefinitions,
            selectedParameterKeys,
        );
        const result = await createCart.mutateAsync({
            url: props.serverURL,
            draft: false,
            data: {
                items: [
                    {
                        product: props.productId,
                        variant: props.variantId,
                        quantity,
                        ...(selectedParametersInput !== undefined && {
                            parameters: selectedParametersInput,
                        }),
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
                parameters: buildProductParameterFormValues(parameterDefinitions, currentItemSelectedParameterKeys),
            }}
            onValuesChange={(changedValues) => {
                if (!("parameters" in changedValues) || !hasItemInCart) {
                    return;
                }

                persistQuantity(currentItemQuantity);
            }}
        >
            {messageContextHolder}
            <ProductParameterSelectionFieldList parameters={parameterDefinitions} />
            {hasItemInCart ? (
                <InputNumber
                    min="0"
                    max={maxAvailable === undefined ? undefined : String(maxAvailable)}
                    step="1"
                    precision={0}
                    stringMode
                    size={size}
                    className={quantityInputClassName}
                    disabled={isMutating}
                    value={quantityText}
                    onChange={(value) => {
                        setQuantityText(value === null || value === undefined ? "" : String(value));
                    }}
                    onStep={(value) => {
                        setQuantityText(String(value));
                        persistQuantity(Number(value));
                    }}
                    onBlur={(event) => {
                        const typedQuantity = event.currentTarget.value.replace(/[^\d]/g, "");
                        if (event.currentTarget.value.includes("-") || typedQuantity === "") {
                            resetQuantityDraft(currentItemQuantity > 0 ? currentItemQuantity : 1);
                            return;
                        }

                        persistQuantity(Number(typedQuantity));
                    }}
                />
            ) : (
                <AddToCartSubmitButton
                    disabled={isMutating}
                    loading={isMutating}
                    onClick={() => {
                        persistQuantity(1);
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
