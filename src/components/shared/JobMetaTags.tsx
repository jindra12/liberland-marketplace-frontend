import * as React from "react";
import {
    GiftOutlined,
    HomeFilled,
    InfoCircleOutlined,
    TeamOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import { Space, Tag } from "antd";
import { IdentityTagLink } from "./IdentityTagLink";
import { JobMetaTagsProps } from "../../types";

export const JobMetaTags: React.FunctionComponent<JobMetaTagsProps> = ({
    showCompany,
    companyName,
    companyIdentity,
    positions,
    bounty,
    isInactive,
    className,
}) => (
    <Space size={[8, 8]} wrap className={className}>
        {showCompany && companyName && (
            <Tag icon={<HomeFilled />}>{companyName}</Tag>
        )}
        {companyIdentity?.name && (
            <IdentityTagLink
                identity={companyIdentity}
                color="success"
                icon={<UsergroupAddOutlined />}
            />
        )}
        {positions && (
            <Tag icon={<TeamOutlined />}>{positions}</Tag>
        )}
        {bounty && (
            <Tag icon={<GiftOutlined />} color="gold">
                Bounty: {bounty}
            </Tag>
        )}
        {isInactive && (
            <Tag icon={<InfoCircleOutlined />}>Inactive</Tag>
        )}
    </Space>
);
