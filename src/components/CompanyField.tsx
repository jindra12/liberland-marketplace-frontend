import * as React from "react";

import { Select } from "antd";

import { useServerUser } from "./auth/useServerUser";
import { useListCompaniesByCreatorQuery } from "./hooks";

type CompanyFieldProps = {
    value?: string | null;
    onChange?: (value: string | null) => void;
    serverURL?: string | null;
    placeholder?: string;
    allowPrivate?: boolean;
};

export const CompanyField: React.FunctionComponent<CompanyFieldProps> = (props) => {
    const serverUser = useServerUser(props.serverURL);
    const companiesQuery = useListCompaniesByCreatorQuery(
        {
            userId: serverUser.user?.id,
            draft: true,
            url: props.serverURL,
        },
        { enabled: Boolean(serverUser.user?.id) },
    );
    const companies = companiesQuery.data?.Companies?.docs ?? [];

    return (
        <Select
            value={props.value}
            onChange={(value) => {
                props.onChange?.(value);
            }}
            placeholder={props.placeholder ?? "Select a company"}
            options={companies
                .filter((company) => props.allowPrivate || !company.isPrivate)
                .map((company) => ({
                    value: company.id,
                    label: company.name,
                }))}
            loading={serverUser.isLoading || companiesQuery.isLoading}
            disabled={!serverUser.user || companiesQuery.isLoading}
            allowClear
        />
    );
};
