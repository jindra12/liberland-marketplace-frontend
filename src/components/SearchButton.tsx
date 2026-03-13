import React from "react";
import { Button, Dropdown } from "antd";
import type { ButtonProps, MenuProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { SearchScope } from "../types";
import { SearchContainer } from "./SearchContainer";

type SearchButtonProps = {
    type?: ButtonProps["type"];
    block?: boolean;
    className?: string;
    children?: React.ReactNode;
};

export const SearchButton: React.FunctionComponent<SearchButtonProps> = ({
    type = "text",
    block,
    className,
    children,
}) => {
    const [scope, setScope] = React.useState<SearchScope>();
    const items: { key: SearchScope, label: string }[] = [
        { key: "jobs", label: "Jobs" },
        { key: "companies", label: "Companies" },
        { key: "startups", label: "Ventures" },
        { key: "identities", label: "Tribes" },
        { key: "products", label: "Products / Services" },
    ];

    const onClick: MenuProps["onClick"] = (info) => {
        const key = info.key as SearchScope;
        setScope(key);
    };

    return (
        <>
            <Dropdown
                trigger={["click"]}
                menu={{ items, onClick }}
                placement="bottomRight"
                overlayClassName="SearchButton__menuOverlay"
            >
                <Button
                    type={type}
                    block={block}
                    className={className}
                    icon={<SearchOutlined />}
                    onClick={(e) => e.preventDefault()}
                >
                    {children}
                </Button>
            </Dropdown>
            {scope && (
                <SearchContainer
                    key={scope}
                    onClose={() => setScope(undefined)}
                    scope={scope}
                />
            )}
        </>
    );
};
