import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import useLocalStorage from "use-local-storage";
import type { ListProductsQuery } from "../../generated/graphql";
import { CartBySecretDocument, CartBySecretQuery, CartBySecretQueryVariables } from "../../generated/graphql";
import { gqlFetcher } from "../../gqlFetcher";
import { CartSecretEntry, CART_SECRETS_INDEX_KEY } from "./cartSecrets";

type ProductDoc = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type CartDoc = NonNullable<NonNullable<CartBySecretQuery["Carts"]>["docs"]>[number];
type CartItemDoc = NonNullable<NonNullable<CartDoc["items"]>[number]>;

export type CartSummary = {
    url: string;
    secret: string;
    cartId: string;
    currency: CartDoc["currency"];
    subtotal: CartDoc["subtotal"];
    items: CartItemDoc[];
    totalQuantity: number;
};

const EMPTY_CART_SECRETS: CartSecretEntry[] = [];

export const useCartItems = () => {
    const [storedEntries] = useLocalStorage<CartSecretEntry[]>(CART_SECRETS_INDEX_KEY, EMPTY_CART_SECRETS);
    const entries = storedEntries ?? EMPTY_CART_SECRETS;

    const queries = useQueries({
        queries: entries.map(({ url, secret }) => ({
            queryKey: ["CartBySecret", url, secret],
            queryFn: gqlFetcher<CartBySecretQuery, CartBySecretQueryVariables>(
                CartBySecretDocument,
                { secret },
                undefined,
                url,
            ),
        })),
    });

    const isLoading = queries.some((query) => query.isLoading || query.isFetching);

    const carts = React.useMemo(() => {
        return entries
            .map((entry, index) => {
                const cart = queries[index]?.data?.Carts?.docs?.[0];
                if (!cart) {
                    return undefined;
                }

                const items = (cart.items || []) as CartItemDoc[];
                return {
                    url: entry.url,
                    secret: entry.secret,
                    cartId: cart.id!,
                    currency: cart.currency,
                    subtotal: cart.subtotal,
                    items,
                    totalQuantity: items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
                };
            })
            .filter((cart): cart is CartSummary => Boolean(cart));
    }, [entries, queries]);

    const products = React.useMemo(() => {
        const productsByKey = carts.reduce<Record<string, ProductDoc>>((acc, cart) => {
            return cart.items.reduce<Record<string, ProductDoc>>((innerAcc, item) => {
                const product = item.product;
                if (!product?.id || !product.serverURL) {
                    return innerAcc;
                }

                const key = `${product.serverURL}::${product.id}`;
                if (!innerAcc[key]) {
                    innerAcc[key] = product as ProductDoc;
                }

                return innerAcc;
            }, acc);
        }, {});

        return Object.values(productsByKey);
    }, [carts]);

    const totalQuantity = React.useMemo(() => {
        return carts.reduce((sum, cart) => sum + cart.totalQuantity, 0);
    }, [carts]);

    const refetch = async () => {
        await Promise.all(queries.map((query) => query.refetch()));
    };

    return {
        isLoading,
        carts,
        products,
        totalQuantity,
        refetch,
    };
};
