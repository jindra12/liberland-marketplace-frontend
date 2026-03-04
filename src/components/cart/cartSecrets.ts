export const CART_SECRET_KEY_PREFIX = "cart.secret.";
export const CART_SECRETS_INDEX_KEY = "cart.secrets";

export type CartSecretEntry = {
    url: string;
    secret: string;
};

export const getCartSecretStorageKey = (url: string) => `${CART_SECRET_KEY_PREFIX}${url}`;
