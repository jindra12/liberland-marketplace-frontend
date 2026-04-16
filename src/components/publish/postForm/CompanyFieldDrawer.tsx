import * as React from "react";

import { Avatar, Empty, Flex, List, Typography } from "antd";

import type { ListCompaniesByCreatorQuery } from "../../../generated/graphql";
import { getImage } from "../../shared/image/utils";

type CompanyDoc = NonNullable<NonNullable<ListCompaniesByCreatorQuery["Companies"]>["docs"]>[number];

export interface CompanyFieldDrawerProps {
    companies: CompanyDoc[];
    onSelect: (value: string) => void;
}

export const CompanyFieldDrawer: React.FunctionComponent<CompanyFieldDrawerProps> = (props) => {
    return props.companies.length > 0 ? (
        <List
            dataSource={props.companies}
            renderItem={(company) => (
                <List.Item
                    className="Publish__companyFieldItem"
                    onClick={() => {
                        props.onSelect(company.id);
                    }}
                >
                    <Flex gap={12} align="center">
                        <Avatar shape="square" size={40} src={company.image?.url ? getImage(company) : undefined} />
                        <Flex vertical gap={4}>
                            <Typography.Text strong>{company.name}</Typography.Text>
                            <Typography.Text type="secondary">{company.serverURL}</Typography.Text>
                        </Flex>
                    </Flex>
                </List.Item>
            )}
        />
    ) : (
        <Empty description="No companies available" />
    );
};
