import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import { CART_SECRETS_INDEX_KEY, type CartSecretEntry } from "../../cart/cartSecrets";
import type { URL as EndpointUrl } from "../../../types";
import { enableOrInsertEndpoint, getDefaultEndpointUrls } from "../../endpoints/utils";
import { mergeCheckoutCartSecrets, readCheckoutHandoff } from "./utils";

export const useCheckoutHandoff = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [handoff] = useState(() =>
        readCheckoutHandoff(
            new URLSearchParams(location.hash.slice(1)).get("mcpCheckout") ||
                new URLSearchParams(location.search).get("mcpCheckout"),
        ),
    );
    const [accepted, setAccepted] = useState(false);
    const [, setCartSecrets] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, []);
    const [, setUrls] = useLocalStorage<EndpointUrl[]>("endpoints.urls", getDefaultEndpointUrls());

    useEffect(() => {
        const search = new URLSearchParams(location.search);
        const hash = new URLSearchParams(location.hash.slice(1));
        if (search.has("mcpCheckout") || hash.has("mcpCheckout")) {
            search.delete("mcpCheckout");
            hash.delete("mcpCheckout");
            navigate(
                { pathname: location.pathname, search: search.toString(), hash: hash.toString() },
                { replace: true },
            );
        }
    }, [location, navigate]);

    const accept = () => {
        setUrls((current) =>
            handoff.carts.reduce(
                (entries, cart) => enableOrInsertEndpoint(entries, cart.serverUrl),
                current || getDefaultEndpointUrls(),
            ),
        );
        setCartSecrets((current) =>
            mergeCheckoutCartSecrets(
                current,
                handoff.carts.map((cart) => ({
                    url: cart.serverUrl,
                    secret: cart.secret,
                })),
            ),
        );
        setAccepted(true);
    };

    return { ...handoff, accepted, accept };
};
