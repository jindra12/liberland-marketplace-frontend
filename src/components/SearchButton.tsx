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
    onScopeSelect?: () => void;
};
export const SearchButton: React.FunctionComponent<SearchButtonProps> = (props) => {
    const type = props.type === undefined ? "text" : props.type;
    const [scope, setScope] = React.useState<SearchScope>();
    const scopeItems: {
        key: SearchScope;
        label: string;
    }[] = [
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
            key: "identities",
            label: "Tribes",
        },
        {
            key: "products",
            label: "Products / Services",
        },
    ];
    const items: MenuProps["items"] = [
        {
            type: "group",
            label: "Looking for",
            children: scopeItems,
        },
    ];
    const onClick: MenuProps["onClick"] = (info) => {
        const key = info.key as SearchScope;
        props.onScopeSelect?.();
        setScope(key);
    };
    return (
        <>
            <Dropdown
                trigger={["click"]}
                menu={{
                    items,
                    onClick,
                }}
                placement="bottomRight"
                overlayClassName="SearchButton__menuOverlay"
            >
                <Button type={type} block={props.block} className={props.className} icon={<SearchOutlined />} onClick={(e) => e.preventDefault()}>
                    {props.children}
                </Button>
            </Dropdown>
            {scope && <SearchContainer key={scope} onClose={() => setScope(undefined)} scope={scope} />}
        </>
    );
};
