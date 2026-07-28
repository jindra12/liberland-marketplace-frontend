import * as React from "react";

import { useSearchParams } from "react-router-dom";

import { Select, Spin } from "antd";
import type { LabeledValue } from "antd/es/select";

import type { DocType, SearchOption } from "../types";

import { useSearchIdentitiesQuery } from "./hooks";

export interface IdentityFilterProps {
    onChange: (ids: string[]) => void;
}

type SelectedIdentity = {
    label: React.ReactNode;
    value: string;
};

export const IdentityFilter: React.FunctionComponent<IdentityFilterProps> = (props) => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedIdentities, setSelectedIdentities] = React.useState<SelectedIdentity[]>(() => {
        const tribe = searchParams.get("tribe");

        return tribe ? [{ label: tribe, value: tribe }] : [];
    });
    const query = useSearchIdentitiesQuery(
        {
            limit: 5,
            page: 1,
            searchTerm,
        },
        {
            enabled: searchTerm.length > 0,
        },
    );

    const options: SearchOption[] =
        !searchTerm || !query.isFetched || !query.data
            ? []
            : (query.data.Searches?.docs ?? [])
                  .filter((searchDoc) => searchDoc.doc?.relationTo === "identities")
                  .map((searchDoc, index) => {
                      const doc = searchDoc.doc!.value as DocType;
                      const value = `${doc.serverURL || ""}|${doc.id!}`;

                      return {
                          key: `${searchDoc.id}-${doc.serverURL || ""}-${value}-${index}`,
                          value,
                          id: doc.id!,
                          label: searchDoc.title || "",
                      };
                  });

    return (
        <Select
            className="FilterControl"
            mode="multiple"
            showSearch
            labelInValue
            allowClear
            placeholder="Filter by tribe"
            value={selectedIdentities}
            searchValue={searchTerm}
            filterOption={false}
            options={options.map((option) => ({
                value: option.id,
                label: option.label || option.id,
            }))}
            notFoundContent={query.isLoading ? <Spin size="small" /> : undefined}
            onSearch={(value) => {
                setSearchTerm(value);
            }}
            onChange={(values: LabeledValue[]) => {
                const nextSelectedIdentities = values.map((value) => ({
                    value: String(value.value),
                    label: value.label ?? value.value,
                }));

                setSelectedIdentities(nextSelectedIdentities);
                props.onChange(nextSelectedIdentities.map((entry) => entry.value));
                setSearchTerm("");
            }}
            onClear={() => {
                setSelectedIdentities([]);
                setSearchTerm("");
                props.onChange([]);
            }}
        />
    );
};
