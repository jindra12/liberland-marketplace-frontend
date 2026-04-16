import * as React from "react";

import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Drawer, Input } from "antd";

import type { ListCompaniesByCreatorQuery } from "../../../generated/graphql";
import { getImage } from "../../shared/image/utils";

import { CompanyFieldDrawer } from "./CompanyFieldDrawer";

type CompanyDoc = NonNullable<NonNullable<ListCompaniesByCreatorQuery["Companies"]>["docs"]>[number];

export interface CompanyFieldProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    companies: CompanyDoc[];
}

export const CompanyField: React.FunctionComponent<CompanyFieldProps> = (props) => {
    const [open, setOpen] = React.useState(false);
    const selectedCompany = props.companies.find((company) => company.id === props.value);

    return (
        <>
            <Input
                readOnly
                value={selectedCompany?.name ?? ""}
                placeholder="Select your company"
                prefix={
                    selectedCompany?.image?.url ? (
                        <Avatar size={24} shape="square" src={getImage(selectedCompany)} />
                    ) : undefined
                }
                suffix={
                    selectedCompany ? (
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
                onClick={() => {
                    setOpen(true);
                }}
            />
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                title="Select company"
                destroyOnHidden
                width={480}
            >
                <CompanyFieldDrawer
                    companies={props.companies}
                    onSelect={(value) => {
                        props.onChange?.(value);
                        setOpen(false);
                    }}
                />
            </Drawer>
        </>
    );
};
