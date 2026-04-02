import * as React from "react";
import type { CompanyByIdQuery } from "../../generated/graphql";
import { getImage } from "../shared/image/utils";
import { useCompanyByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";
type UnsubscribeCompanyProps = {
    params: ParsedUnsubscribeParams;
};
const UnsubscribeCompany: React.FunctionComponent<UnsubscribeCompanyProps> = (props) => {
    const query = useCompanyByIdQuery(
        {
            id: props.params.id,
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
                    detailPath: getNotificationDetailPath(props.params.collection, company.id),
                };
            }}
        />
    );
};
export default UnsubscribeCompany;
