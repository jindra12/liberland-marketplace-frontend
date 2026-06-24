import { CART_SECRETS_INDEX_KEY, type CartSecretEntry } from "./cartSecrets";

export const notifyCartSecretsChanged = (entries: CartSecretEntry[]) => {
    window.dispatchEvent(
        new StorageEvent("storage", {
            key: CART_SECRETS_INDEX_KEY,
            newValue: JSON.stringify(entries),
        }),
    );
};

export const clampCartQuantity = (quantity: number | null | undefined, maxAvailable?: number | null) => {
    const normalizedQuantity = typeof quantity === "number" && Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    const nonNegativeQuantity = Math.max(0, normalizedQuantity);

    if (typeof maxAvailable !== "number") {
        return nonNegativeQuantity;
    }

    return Math.min(nonNegativeQuantity, Math.max(0, Math.floor(maxAvailable)));
};

export const getInitialCartQuantity = (currentItemQuantity: number) => {
    return currentItemQuantity > 0 ? currentItemQuantity : 1;
};
