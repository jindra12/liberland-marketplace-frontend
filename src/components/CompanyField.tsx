import * as React from "react";

import { Select } from "antd";

import { useListCompaniesByCreatorQuery } from "./hooks";

type CompanyFieldProps = {
    value?: string | null;
    onChange?: (value: string | null) => void;
    serverURL?: string | null;
    userId?: string | null;
    placeholder?: string;
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
                .filter((company) => Boolean(company.name))
                .map((company) => ({
                    value: company.id,
                    label: company.name as string,
                }))}
            loading={companiesQuery.isLoading}
            disabled={companiesQuery.isLoading}
            allowClear
        />
    );
};
