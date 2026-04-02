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
const UnsubscribeProduct: React.FunctionComponent<UnsubscribeProductProps> = (props) => {
    const query = useProductByIdQuery(
        {
            id: props.params.id,
        },
        {
            enabled: Boolean(props.params.id),
        },
    );
    return (
        <UnsubscribeEntity<ProductByIdQuery>
            params={props.params}
            query={query}
            resolveEntity={(data) => {
                const product = data.Product;
                if (!product) {
                    return null;
                }
                return {
                    collection: props.params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[props.params.collection],
                    targetID: product.id,
                    title: product.name || NOTIFICATION_TARGET_LABELS[props.params.collection],
                    summary: product.company?.name ? `Company: ${product.company.name}` : product.description,
                    imageURL: getImage(product) || getImage(product.company),
                    serverURL: product.serverURL,
                    detailPath: getNotificationDetailPath(props.params.collection, product.id),
                };
            }}
        />
    );
};
export default UnsubscribeProduct;
