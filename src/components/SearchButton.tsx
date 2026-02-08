import React from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { SearchScope } from "../types";
import { SearchContainer } from "./SearchContainer";

export const SearchButton: React.FunctionComponent = () => {
    const [scope, setScope] = React.useState<SearchScope>();
    const items: { key: SearchScope, label: string }[] = [
        { key: "jobs", label: "Jobs" },
        { key: "companies", label: "Companies" },
        { key: "identities", label: "Identities" },
        { key: "products", label: "Products / Services" },
    ];

    const onClick: MenuProps["onClick"] = (info) => {
        const key = info.key as SearchScope;
        setScope(key);
    };

    return (
        <>
            <Dropdown
                trigger={["click", "hover"]}
                menu={{ items, onClick }}
                placement="bottomRight"
            >
                <Button
                    type="text"
                    icon={<SearchOutlined />}
                    onClick={(e) => e.preventDefault()}
                />
            </Dropdown>
            {scope && (
                <SearchContainer
                    onClose={() => setScope(undefined)}
                    scope={scope}
                />
            )}
        </>
    );
};