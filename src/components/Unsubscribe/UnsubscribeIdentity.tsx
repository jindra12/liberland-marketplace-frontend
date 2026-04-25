import * as React from "react";

import type { IdentityByIdQuery } from "../../generated/graphql";
import { useIdentityByIdQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

import { NOTIFICATION_TARGET_LABELS } from "./constants";
import type { ParsedUnsubscribeParams } from "./types";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";

type UnsubscribeIdentityProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeIdentity: React.FunctionComponent<UnsubscribeIdentityProps> = (props) => {
    const query = useIdentityByIdQuery(
        {
            id: props.params.id,
            url: props.params.serverURL,
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
                    detailPath: getNotificationDetailPath(
                        props.params.collection,
                        identity.id,
                        identity.serverURL ?? props.params.serverURL,
                    ),
                };
            }}
        />
    );
};
export default UnsubscribeIdentity;
