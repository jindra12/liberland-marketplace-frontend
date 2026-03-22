import * as React from "react";
import type { CompanyByIdQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { useCompanyByIdQuery } from "../hooks";
import { NOTIFICATION_TARGET_LABELS } from "./constants";
import { UnsubscribeEntity } from "./UnsubscribeEntity";
import { getNotificationDetailPath } from "./utils";
import type { ParsedUnsubscribeParams } from "./types";

type UnsubscribeCompanyProps = {
    params: ParsedUnsubscribeParams;
};

const UnsubscribeCompany: React.FunctionComponent<UnsubscribeCompanyProps> = ({ params }) => {
    const query = useCompanyByIdQuery(
        { id: params.id },
        { enabled: Boolean(params.id) },
    );

    return (
        <UnsubscribeEntity<CompanyByIdQuery>
            params={params}
            query={query}
            resolveEntity={(data) => {
                const company = data.Company;
                if (!company) {
                    return null;
                }

                return {
                    collection: params.collection,
                    typeLabel: NOTIFICATION_TARGET_LABELS[params.collection],
                    targetID: company.id,
                    title: company.name || NOTIFICATION_TARGET_LABELS[params.collection],
                    summary: company.description,
                    imageURL: getImage(company),
                    serverURL: company.serverURL,
                    detailPath: getNotificationDetailPath(params.collection, company.id),
                };
            }}
        />
    );
};

export default UnsubscribeCompany;
