import * as React from "react";

import { Tabs } from "antd";

import { IdentityCompaniesTab } from "./IdentityCompaniesTab";
import { IdentityJobsTab } from "./IdentityJobsTab";
import { IdentityProductsTab } from "./IdentityProductsTab";
import { IdentityVenturesTab } from "./IdentityVenturesTab";
import type { IdentityDetailTabsProps } from "./types";

export const IdentityDetailTabs: React.FunctionComponent<IdentityDetailTabsProps> = (props) => {
    return (
        <Tabs
            className="EntityDetail__tabs IdentityDetail__tabs"
            defaultActiveKey="products"
            items={[
                {
                    key: "products",
                    label: "Products",
                    children: <IdentityProductsTab identityId={props.identityId} serverURL={props.serverURL} />,
                },
                {
                    key: "jobs",
                    label: "Jobs",
                    children: <IdentityJobsTab identityId={props.identityId} serverURL={props.serverURL} />,
                },
                {
                    key: "companies",
                    label: "Companies",
                    children: <IdentityCompaniesTab identityId={props.identityId} serverURL={props.serverURL} />,
                },
                {
                    key: "ventures",
                    label: "Ventures",
                    children: <IdentityVenturesTab identityId={props.identityId} serverURL={props.serverURL} />,
                },
            ]}
        />
    );
};
