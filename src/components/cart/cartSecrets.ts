export const CART_SECRETS_INDEX_KEY = "cart.secrets";

export type CartSecretEntry = {
    url: string;
    secret: string;
};

export const readStoredCartSecret = (serverUrl: string): string => {
    const stored = window.localStorage.getItem(CART_SECRETS_INDEX_KEY);
    if (!stored) {
        return "";
    }
    try {
        const entries: CartSecretEntry[] = JSON.parse(stored);
        return entries.find((entry) => entry.url === serverUrl)?.secret || "";
    } catch (error) {
        console.error("Could not read saved cart access", error);
        return "";
    }
};
