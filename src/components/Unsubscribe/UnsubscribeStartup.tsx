import * as React from "react";
import type { StartupByIdQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { useStartupByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";
type UnsubscribeStartupProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeStartup: React.FunctionComponent<UnsubscribeStartupProps> = (props) => {
    const query = useStartupByIdQuery(
        {
            id: props.params.id,
        },
        {
            enabled: Boolean(props.params.id),
        },
    );
    return (
        <UnsubscribeEntity<StartupByIdQuery>
            params={props.params}
            query={query}
            resolveEntity={(data) => {
                const startup = data.Startup;
                if (!startup) {
                    return null;
                }
                return {
                    collection: props.params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[props.params.collection],
                    targetID: startup.id,
                    title: startup.title || NOTIFICATION_TARGET_LABELS[props.params.collection],
                    summary: startup.company?.name ? `Company: ${startup.company.name}` : startup.description,
                    imageURL: getImage(startup) || getImage(startup.identity),
                    serverURL: startup.serverURL,
                    detailPath: getNotificationDetailPath(props.params.collection, startup.id),
                };
            }}
        />
    );
};
export default UnsubscribeStartup;
