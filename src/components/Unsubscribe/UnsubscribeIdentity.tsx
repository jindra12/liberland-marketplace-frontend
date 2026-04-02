import * as React from "react";
import type { IdentityByIdQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { useIdentityByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";
type UnsubscribeIdentityProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeIdentity: React.FunctionComponent<UnsubscribeIdentityProps> = (props) => {
    const query = useIdentityByIdQuery(
        {
            id: props.params.id,
        },
        {
            enabled: Boolean(props.params.id),
        },
    );
    return (
        <UnsubscribeEntity<IdentityByIdQuery>
            params={props.params}
            query={query}
            resolveEntity={(data) => {
                const identity = data.Identity;
                if (!identity) {
                    return null;
                }
                return {
                    collection: props.params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[props.params.collection],
                    targetID: identity.id,
                    title: identity.name || NOTIFICATION_TARGET_LABELS[props.params.collection],
                    summary: identity.description || identity.website,
                    imageURL: getImage(identity),
                    serverURL: identity.serverURL,
                    detailPath: getNotificationDetailPath(props.params.collection, identity.id),
                };
            }}
        />
    );
};
export default UnsubscribeIdentity;
