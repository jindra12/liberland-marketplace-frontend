import * as React from "react";

import type { CompanyByIdQuery } from "../../generated/graphql";
import { useCompanyByIdQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

import { NOTIFICATION_TARGET_LABELS } from "./constants";
import type { ParsedUnsubscribeParams } from "./types";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";

type UnsubscribeCompanyProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeCompany: React.FunctionComponent<UnsubscribeCompanyProps> = (props) => {
    const query = useCompanyByIdQuery(
        {
            id: props.params.id,
            url: props.params.serverURL,
        },
        {
            enabled: Boolean(props.params.id),
        },
    );
    return (
        <UnsubscribeEntity<CompanyByIdQuery>
            params={props.params}
            query={query}
            resolveEntity={(data) => {
                const company = data.Company;
                if (!company) {
                    return null;
                }
                return {
                    collection: props.params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[props.params.collection],
                    targetID: company.id,
                    title: company.name || NOTIFICATION_TARGET_LABELS[props.params.collection],
                    summary: company.description,
                    imageURL: getImage(company),
                    serverURL: company.serverURL,
                    detailPath: getNotificationDetailPath(
                        props.params.collection,
                        company.id,
                        company.serverURL ?? props.params.serverURL,
                    ),
                };
            }}
        />
    );
};
export default UnsubscribeCompany;
