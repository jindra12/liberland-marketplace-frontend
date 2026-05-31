import * as React from "react";

import { Select } from "antd";

import { useListCompaniesByCreatorQuery } from "./hooks";

type CompanyFieldProps = {
    value?: string | null;
    onChange?: (value: string | null) => void;
    serverURL?: string | null;
    userId?: string | null;
    placeholder?: string;
    allowPrivate?: boolean;
};

export const CompanyField: React.FunctionComponent<CompanyFieldProps> = (props) => {
    const companiesQuery = useListCompaniesByCreatorQuery({
        userId: props.userId,
        draft: true,
        url: props.serverURL,
    });
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
            loading={companiesQuery.isLoading}
            disabled={companiesQuery.isLoading}
            allowClear
        />
    );
};
