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

const UnsubscribeIdentity: React.FunctionComponent<UnsubscribeIdentityProps> = ({ params }) => {
    const query = useIdentityByIdQuery(
        { id: params.id },
        { enabled: Boolean(params.id) },
    );

    return (
        <UnsubscribeEntity<IdentityByIdQuery>
            params={params}
            query={query}
            resolveEntity={(data) => {
                const identity = data.Identity;
                if (!identity) {
                    return null;
                }

                return {
                    collection: params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[params.collection],
                    targetID: identity.id,
                    title: identity.name || NOTIFICATION_TARGET_LABELS[params.collection],
                    summary: identity.description || identity.website,
                    imageURL: getImage(identity),
                    serverURL: identity.serverURL,
                    detailPath: getNotificationDetailPath(params.collection, identity.id),
                };
            }}
        />
    );
};

export default UnsubscribeIdentity;
