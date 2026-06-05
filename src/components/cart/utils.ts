import { CART_SECRETS_INDEX_KEY, type CartSecretEntry } from "./cartSecrets";

export const notifyCartSecretsChanged = (entries: CartSecretEntry[]) => {
    window.dispatchEvent(
        new StorageEvent("storage", {
            key: CART_SECRETS_INDEX_KEY,
            newValue: JSON.stringify(entries),
        }),
    );
};
