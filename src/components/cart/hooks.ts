import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Form, message, type ButtonProps, type FormInstance } from "antd";
import useLocalStorage from "use-local-storage";

import type { Cart, MeUserQuery } from "../../generated/graphql";
import { useCartBySecretQuery } from "../hooks";
import { buildProfileShippingAddresses } from "../order/utils";
import type { ProductParameterSelectionMap, ProductParameterSource } from "../productParameters/types";
import {
    buildProductParameterFormValues,
    buildProductParameterSelectionMap,
    buildProductParameterSelectionMapFromFormValues,
    buildSelectedProductParametersInput,
} from "../productParameters/utils";
import { CART_SECRETS_INDEX_KEY, type CartSecretEntry } from "./cartSecrets";
import {
    areProductParameterSelectionMapsEqual,
    buildAddToCartButtonClassName,
    buildAddToCartFormClassName,
    buildAddToCartProductKey,
    buildAddToCartQuantityInputClassName,
    buildCartItemsByKey,
    getCartSecretForServer,
    getCurrentCartItem,
    getInitialCartQuantity,
    getParameterDefinitionsForCartItem,
    clampCartQuantity,
} from "./utils";
import { useCartMutationContext } from "./CartMutationContext";
import { useCreateCartMutation, useUpdateCartMutation } from "../hooks";

type SharedAddToCartStateProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    maxAvailable?: number | null;
    isAuthenticated?: boolean;
    me?: MeUserQuery[];
    parameters?: ProductParameterSource[] | null;
};

export const useAddToCartSharedState = (props: SharedAddToCartStateProps) => {
    const [cartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const cartSecret = React.useMemo(
        () => getCartSecretForServer(cartSecrets, props.serverURL),
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
    const existingCart = cartQuery.data?.Carts?.docs?.[0] as Cart | undefined;
    const productKey = buildAddToCartProductKey(props.productId, props.variantId);
    const currentItem = getCurrentCartItem(existingCart, productKey);
    const parameterDefinitions = getParameterDefinitionsForCartItem(currentItem, props.parameters);
    const currentItemQuantity = currentItem?.quantity ?? 0;
    const hasItemInCart = currentItemQuantity > 0;
    const currentItemSelectedParameterKeys = buildProductParameterSelectionMap(currentItem?.parameters);
    const candidateProfileAddresses = React.useMemo(
        () => buildProfileShippingAddresses(props.me || []),
        [props.me],
    );

    return {
        candidateProfileAddresses,
        candidateProfileAddressesForBuyNow: props.isAuthenticated ? candidateProfileAddresses : [],
        cartQuery,
        cartSecret,
        currentItem,
        currentItemQuantity,
        currentItemSelectedParameterKeys,
        existingCart,
        hasItemInCart,
        maxAvailable: typeof props.maxAvailable === "number" ? props.maxAvailable : undefined,
        parameterDefinitions,
        parameterFormValues: buildProductParameterFormValues(parameterDefinitions, currentItemSelectedParameterKeys),
        productKey,
    };
};

type AddToCartButtonStateProps = SharedAddToCartStateProps & {
    block?: boolean;
    size?: ButtonProps["size"];
    form: FormInstance;
};

export const useAddToCartButtonState = (props: AddToCartButtonStateProps) => {
    const sharedState = useAddToCartSharedState(props);
    const watchedQuantity = Form.useWatch("quantity", props.form);
    const size = props.size || "large";

    return {
        ...sharedState,
        compactClassName: buildAddToCartButtonClassName(props.block, sharedState.hasItemInCart),
        inputQuantity:
            typeof watchedQuantity === "number" && watchedQuantity > 0
                ? watchedQuantity
                : sharedState.currentItemQuantity > 0
                  ? sharedState.currentItemQuantity
                  : 1,
        size,
    };
};

type AddToCartIncrementStateProps = SharedAddToCartStateProps & {
    form: FormInstance;
    size?: ButtonProps["size"];
};

export const useAddToCartIncrementFormState = (props: AddToCartIncrementStateProps) => {
    const sharedState = useAddToCartSharedState(props);
    const queryClient = useQueryClient();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [cartSecrets, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const createCart = useCreateCartMutation();
    const updateCart = useUpdateCartMutation();
    const { isMutating, setIsMutating } = useCartMutationContext();
    const [quantityText, setQuantityText] = React.useState(() => String(getInitialCartQuantity(sharedState.currentItemQuantity)));
    const quantityInputClassName = buildAddToCartQuantityInputClassName(props.size || "large");
    const formClassName = buildAddToCartFormClassName(sharedState.hasItemInCart);

    React.useEffect(() => {
        setQuantityText(String(getInitialCartQuantity(sharedState.currentItemQuantity)));
    }, [sharedState.currentItemQuantity]);

    const resetQuantityDraft = (nextQuantity: number) => {
        setQuantityText(String(nextQuantity > 0 ? nextQuantity : 1));
    };

    const updateExistingCartItems = async (existingCart: Cart, itemsByKey: Record<string, ReturnType<typeof buildCartItemsByKey>[string]>) => {
        await updateCart.mutateAsync({
            url: props.serverURL,
            id: existingCart.id,
            draft: false,
            data: {
                items: Object.values(itemsByKey).filter((item) => (item.quantity ?? 0) > 0),
            },
        });
    };

    const addItemToNewCart = async (quantity: number, selectedParameterKeys: ProductParameterSelectionMap) => {
        const selectedParametersInput = buildSelectedProductParametersInput(sharedState.parameterDefinitions, selectedParameterKeys);
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
            await queryClient.invalidateQueries({
                queryKey: ["CartBySecret"],
            });
        }
    };

    const persistQuantity = async (nextQuantityValue: number | null | undefined) => {
        const nextQuantity = clampCartQuantity(nextQuantityValue, sharedState.maxAvailable);
        const selectedParameterKeys = buildProductParameterSelectionMapFromFormValues(
            props.form.getFieldValue("parameters"),
        );

        if (!sharedState.hasItemInCart && nextQuantity <= 0) {
            resetQuantityDraft(1);
            return;
        }

        if (isMutating) {
            messageApi.info("Loading, please try again");
            return;
        }

        const normalizedQuantity = sharedState.hasItemInCart ? nextQuantity : Math.max(1, nextQuantity);
        const quantityHasChanged = normalizedQuantity !== sharedState.currentItemQuantity;
        const selectedParametersChanged = !areProductParameterSelectionMapsEqual(
            buildProductParameterSelectionMap(sharedState.currentItem?.parameters),
            selectedParameterKeys,
        );

        if (!quantityHasChanged && !selectedParametersChanged && nextQuantity > 0) {
            resetQuantityDraft(normalizedQuantity);
            return;
        }

        setIsMutating(true);
        try {
            if (!sharedState.existingCart?.id) {
                await addItemToNewCart(normalizedQuantity, selectedParameterKeys);
            } else {
                const itemsByKey = buildCartItemsByKey(sharedState.existingCart as Cart);
                const productItem = itemsByKey[sharedState.productKey];
                const selectedParametersInput = buildSelectedProductParametersInput(
                    sharedState.parameterDefinitions,
                    selectedParameterKeys,
                );

                if (normalizedQuantity <= 0) {
                    if (!productItem) {
                        props.form.setFieldValue("quantity", 1);
                        return;
                    }

                    delete itemsByKey[sharedState.productKey];
                } else if (!productItem) {
                    itemsByKey[sharedState.productKey] = {
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

                await updateExistingCartItems(sharedState.existingCart as Cart, itemsByKey);
                await sharedState.cartQuery.refetch();
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

    return {
        ...sharedState,
        formClassName,
        messageContextHolder,
        quantityInputClassName,
        quantityText,
        isMutating,
        persistQuantity,
        resetQuantityDraft,
        setQuantityText,
    };
};
