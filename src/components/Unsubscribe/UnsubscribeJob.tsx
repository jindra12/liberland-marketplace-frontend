import * as React from "react";

import type { JobByIdQuery } from "../../generated/graphql";
import { useJobByIdQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

import { NOTIFICATION_TARGET_LABELS } from "./constants";
import type { ParsedUnsubscribeParams } from "./types";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";

type UnsubscribeJobProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeJob: React.FunctionComponent<UnsubscribeJobProps> = (props) => {
    const query = useJobByIdQuery(
        {
            id: props.params.id,
            url: props.params.serverURL,
        },
        {
            enabled: Boolean(props.params.id),
        },
    );
    return (
        <UnsubscribeEntity<JobByIdQuery>
            params={props.params}
            query={query}
            resolveEntity={(data) => {
                const job = data.Job;
                if (!job) {
                    return null;
                }
                return {
                    collection: props.params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[props.params.collection],
                    targetID: job.id,
                    title: job.title || NOTIFICATION_TARGET_LABELS[props.params.collection],
                    summary: job.company?.name ? `Company: ${job.company.name}` : job.description,
                    imageURL: getImage(job) || getImage(job.company),
                    serverURL: job.serverURL,
                    detailPath: getNotificationDetailPath(
                        props.params.collection,
                        job.id,
                        job.serverURL ?? props.params.serverURL,
                    ),
                };
            }}
        />
    );
};
export default UnsubscribeJob;
