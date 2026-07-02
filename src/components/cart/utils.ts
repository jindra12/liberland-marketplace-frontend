import type { Cart, MutationCartUpdate_ItemsInput } from "../../generated/graphql";
import type { CartSecretEntry } from "./cartSecrets";
import { ADD_TO_CART_INITIAL_QUANTITY, ADD_TO_CART_PRODUCT_KEY_SEPARATOR } from "./constants";
import type { ProductParameterSelectionMap, ProductParameterSource } from "../productParameters/types";

export const notifyCartSecretsChanged = (entries: CartSecretEntry[]) => {
    window.dispatchEvent(
        new StorageEvent("storage", {
            key: "cart.secrets",
            newValue: JSON.stringify(entries),
        }),
    );
};

export const getCartSecretForServer = (cartSecrets: CartSecretEntry[] | null | undefined, serverURL: string) =>
    (cartSecrets || []).find((entry) => entry.url === serverURL)?.secret || "";

export const buildAddToCartProductKey = (productId: string, variantId?: string) =>
    `${productId}${ADD_TO_CART_PRODUCT_KEY_SEPARATOR}${variantId || ""}`;

export const getCurrentCartItem = (cart: Cart | undefined, productKey: string) =>
    cart?.items?.find((item) => buildAddToCartProductKey(item.product?.id || "", item.variant?.id) === productKey);

export const getParameterDefinitionsForCartItem = (
    currentItem: ReturnType<typeof getCurrentCartItem>,
    fallbackParameters?: ProductParameterSource[] | null,
) => currentItem?.product?.parameters ?? fallbackParameters ?? [];

export const areProductParameterSelectionMapsEqual = (
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

export const buildAddToCartButtonClassName = (block?: boolean, hasItemInCart?: boolean) =>
    [
        "AddToCartButton__compact",
        hasItemInCart ? "" : "AddToCartButton__compact--split",
        block ? "AddToCartButton__compact--block" : "",
    ]
        .filter(Boolean)
        .join(" ");

export const buildAddToCartFormClassName = (hasItemInCart?: boolean) =>
    ["AddToCartButton", hasItemInCart ? "" : "AddToCartButton--split"].filter(Boolean).join(" ");

export const buildAddToCartQuantityInputClassName = (size: string) =>
    ["AddToCartButton__quantity", size === "small" ? "AddToCartButton__quantity--small" : "AddToCartButton__quantity--default"].join(" ");

export const getInitialCartQuantity = (currentItemQuantity: number) =>
    currentItemQuantity > 0 ? currentItemQuantity : ADD_TO_CART_INITIAL_QUANTITY;

export const clampCartQuantity = (quantity: number | null | undefined, maxAvailable?: number | null) => {
    const normalizedQuantity = typeof quantity === "number" && Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    const nonNegativeQuantity = Math.max(0, normalizedQuantity);

    if (typeof maxAvailable !== "number") {
        return nonNegativeQuantity;
    }

    return Math.min(nonNegativeQuantity, Math.max(0, Math.floor(maxAvailable)));
};

export const buildCartItemsByKey = (existingCart: Cart): Record<string, MutationCartUpdate_ItemsInput> => {
    const existingItems = existingCart.items || [];

    return Object.fromEntries(
        existingItems.map((item) => {
            const mutationItem: MutationCartUpdate_ItemsInput = {
                quantity: item.quantity ?? 1,
            };
            mutationItem.id = item.id!;
            mutationItem.product = item.product?.id;
            mutationItem.variant = item.variant?.id;
            return [buildAddToCartProductKey(item.product?.id || "", item.variant?.id), mutationItem];
        }),
    );
};
