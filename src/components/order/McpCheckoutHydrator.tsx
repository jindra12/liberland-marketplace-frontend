import * as React from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import useLocalStorage from "use-local-storage";

import { CART_SECRETS_INDEX_KEY, type CartSecretEntry } from "../cart/cartSecrets";
import { notifyCartSecretsChanged } from "../cart/utils";

type CheckoutPayload = { carts: Array<{ serverUrl: string; secret: string }> };

export const McpCheckoutHydrator: React.FunctionComponent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);

    React.useEffect(() => {
        const encoded = searchParams.get("mcpCheckout");
        if (!encoded) return;

        const payload = JSON.parse(atob(encoded)) as CheckoutPayload;
        const entries: CartSecretEntry[] = payload.carts
            .filter((entry) => entry.serverUrl && entry.secret)
            .map((entry) => ({ url: entry.serverUrl, secret: entry.secret }));
        setCartSecrets(entries);
        notifyCartSecretsChanged(entries);
        navigate("/order", { replace: true });
    }, [navigate, searchParams, setCartSecrets]);

    return null;
};
