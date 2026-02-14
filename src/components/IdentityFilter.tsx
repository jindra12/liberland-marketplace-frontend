import * as React from "react";
import { Select } from "antd";
import { useListIdentitiesQuery } from "../generated/graphql";

export interface IdentityFilterProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export const IdentityFilter: React.FunctionComponent<IdentityFilterProps> = (props) => {
    const query = useListIdentitiesQuery({ limit: 1000, page: 0 });
    const identities = query.data?.Identities?.docs || [];

    const options = identities.map((identity) => ({
        value: identity.id,
        label: identity.name,
    }));

    return (
        <Select
            mode="multiple"
            placeholder="Filter by identity"
            value={props.selectedIds}
            onChange={props.onChange}
            options={options}
            loading={query.isLoading}
            allowClear
            className="FilterControl"
        />
    );
};
