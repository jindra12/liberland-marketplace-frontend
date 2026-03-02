import * as React from "react";

export const CART_SECRET_KEY_PREFIX = "cart.secret.";
export const CART_UPDATED_EVENT = "cart.updated";

type CartSecretEntry = {
    url: string;
    secret: string;
};

const parseStoredString = (stored: string | null) => {
    if (!stored) {
        return "";
    }

    try {
        const parsed = JSON.parse(stored);
        return typeof parsed === "string" ? parsed : "";
    } catch {
        return stored;
    }
};

export const getStoredCartSecrets = (): CartSecretEntry[] => {
    const entries: CartSecretEntry[] = [];

    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(CART_SECRET_KEY_PREFIX)) {
            continue;
        }

        const url = key.slice(CART_SECRET_KEY_PREFIX.length);
        const secret = parseStoredString(localStorage.getItem(key));
        if (!url || !secret) {
            continue;
        }

        entries.push({ url, secret });
    }

    return entries;
};

export const notifyCartUpdated = () => {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

export const useCartStorageVersion = () => {
    const [version, setVersion] = React.useState(0);

    React.useEffect(() => {
        const handleChange = () => {
            setVersion((current) => current + 1);
        };

        window.addEventListener(CART_UPDATED_EVENT, handleChange);
        window.addEventListener("storage", handleChange);

        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, []);

    return version;
};
