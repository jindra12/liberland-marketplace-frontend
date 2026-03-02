import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import type { ListProductsQuery } from "../../generated/graphql";
import {
    CartBySecretDocument,
    CartBySecretQuery,
    CartBySecretQueryVariables,
} from "../../generated/graphql";
import { gqlFetcher } from "../../gqlFetcher";
import { getStoredCartSecrets, useCartStorageVersion } from "./cartStorage";

type ProductDoc = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];

export const useCartItems = () => {
    const version = useCartStorageVersion();
    const entries = React.useMemo(() => getStoredCartSecrets(), [version]);

    const queries = useQueries({
        queries: entries.map(({ url, secret }) => ({
            queryKey: ["CartBySecret", url, secret, version],
            queryFn: gqlFetcher<CartBySecretQuery, CartBySecretQueryVariables>(
                CartBySecretDocument,
                { secret },
                undefined,
                url,
            ),
        })),
    });

    const isLoading = queries.some((query) => query.isLoading || query.isFetching);

    const products = React.useMemo(() => {
        const productsByKey: Record<string, ProductDoc> = {};

        queries.forEach((query) => {
            const items = query.data?.Carts?.docs?.[0]?.items || [];
            items.forEach((item) => {
                const product = item.product;
                if (!product?.id || !product.serverURL) {
                    return;
                }

                const key = `${product.serverURL}::${product.id}`;
                if (!productsByKey[key]) {
                    productsByKey[key] = product as ProductDoc;
                }
            });
        });

        return Object.values(productsByKey);
    }, [queries]);

    const totalQuantity = React.useMemo(() => {
        return queries.reduce((sum, query) => {
            const items = query.data?.Carts?.docs?.[0]?.items || [];
            return sum + items.reduce((itemsSum, item) => itemsSum + (item.quantity ?? 0), 0);
        }, 0);
    }, [queries]);

    const refetch = async () => {
        await Promise.all(queries.map((query) => query.refetch()));
    };

    return {
        isLoading,
        products,
        totalQuantity,
        refetch,
    };
};
