import * as React from "react";
import type { ProductByIdQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { useProductByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";

type UnsubscribeProductProps = {
    params: ParsedUnsubscribeParams;
};

const UnsubscribeProduct: React.FunctionComponent<UnsubscribeProductProps> = ({ params }) => {
    const query = useProductByIdQuery(
        { id: params.id },
        { enabled: Boolean(params.id) },
    );

    return (
        <UnsubscribeEntity<ProductByIdQuery>
            params={params}
            query={query}
            resolveEntity={(data) => {
                const product = data.Product;
                if (!product) {
                    return null;
                }

                return {
                    collection: params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[params.collection],
                    targetID: product.id,
                    title: product.name || NOTIFICATION_TARGET_LABELS[params.collection],
                    summary: product.company?.name ? `Company: ${product.company.name}` : product.description,
                    imageURL: getImage(product) || getImage(product.company),
                    serverURL: product.serverURL,
                    detailPath: getNotificationDetailPath(params.collection, product.id),
                };
            }}
        />
    );
};

export default UnsubscribeProduct;
