import * as React from "react";
import type { JobByIdQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { useJobByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";

type UnsubscribeJobProps = {
    params: ParsedUnsubscribeParams;
};

const UnsubscribeJob: React.FunctionComponent<UnsubscribeJobProps> = ({ params }) => {
    const query = useJobByIdQuery(
        { id: params.id },
        { enabled: Boolean(params.id) },
    );

    return (
        <UnsubscribeEntity<JobByIdQuery>
            params={params}
            query={query}
            resolveEntity={(data) => {
                const job = data.Job;
                if (!job) {
                    return null;
                }

                return {
                    collection: params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[params.collection],
                    targetID: job.id,
                    title: job.title || NOTIFICATION_TARGET_LABELS[params.collection],
                    summary: job.company?.name ? `Company: ${job.company.name}` : job.description,
                    imageURL: getImage(job) || getImage(job.company),
                    serverURL: job.serverURL,
                    detailPath: getNotificationDetailPath(params.collection, job.id),
                };
            }}
        />
    );
};

export default UnsubscribeJob;
