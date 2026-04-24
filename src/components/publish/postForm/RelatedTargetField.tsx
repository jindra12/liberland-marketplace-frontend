import * as React from "react";

import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input } from "antd";
import type { MenuProps } from "antd";

import { SearchScope } from "../../../types";
import { SearchContainer } from "../../SearchContainer";
import type { RelatedTargetSelection } from "../../shared/post/types";

export interface RelatedTargetFieldProps {
    value?: RelatedTargetSelection | null;
    onChange?: (value: RelatedTargetSelection | null) => void;
}

const scopeItems: NonNullable<MenuProps["items"]> = [
    {
        type: "group",
        label: "Looking for",
        children: [
            {
                key: "jobs",
                label: "Jobs",
            },
            {
                key: "companies",
                label: "Companies",
            },
            {
                key: "startups",
                label: "Ventures",
            },
            {
                key: "posts",
                label: "Posts",
            },
            {
                key: "identities",
                label: "Tribes",
            },
            {
                key: "products",
                label: "Products / Services",
            },
        ],
    },
];

export const RelatedTargetField: React.FunctionComponent<RelatedTargetFieldProps> = (props) => {
    const [scope, setScope] = React.useState<SearchScope>();

    return (
        <>
            <Dropdown
                trigger={["click"]}
                menu={{
                    items: scopeItems,
                    onClick: (info) => {
                        setScope(info.key as SearchScope);
                    },
                }}
                placement="bottomLeft"
                overlayClassName="SearchButton__menuOverlay"
            >
                <Input
                    readOnly
                    value={props.value?.label ?? ""}
                    placeholder="Select related content"
                    prefix={
                        props.value ? (
                            <Avatar size={24} shape="square">
                                {props.value.label.slice(0, 1).toUpperCase()}
                            </Avatar>
                        ) : undefined
                    }
                    suffix={
                        props.value ? (
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    props.onChange?.(null);
                                }}
                            />
                        ) : (
                            <SearchOutlined />
                        )
                    }
                    onClick={(event) => {
                        event.preventDefault();
                    }}
                />
            </Dropdown>
            {scope && (
                <SearchContainer
                    key={scope}
                    onClose={() => setScope(undefined)}
                    onSelect={(selection) => {
                        props.onChange?.(selection);
                        setScope(undefined);
                    }}
                    scope={scope}
                />
            )}
        </>
    );
};
