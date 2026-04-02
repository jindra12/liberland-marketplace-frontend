import * as React from "react";
import { GiftOutlined, HomeFilled, InfoCircleOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Space, Tag } from "antd";
import { IdentityTagItem, IdentityTagLink } from "./IdentityTagLink";
type JobMetaTagsProps = {
    showCompany?: boolean;
    companyName?: string | null;
    companyIdentity?: IdentityTagItem;
    positions?: string | null;
    bounty?: string | null;
    isInactive?: boolean;
    className?: string;
};
export const JobMetaTags: React.FunctionComponent<JobMetaTagsProps> = (props) => {
    return (
        <Space size={[8, 8]} wrap className={props.className}>
            {props.showCompany && props.companyName && <Tag icon={<HomeFilled />}>{props.companyName}</Tag>}
            {props.companyIdentity?.name && <IdentityTagLink identity={props.companyIdentity} color="success" icon={<UsergroupAddOutlined />} />}
            {props.positions && <Tag icon={<TeamOutlined />}>{props.positions}</Tag>}
            {props.bounty && (
                <Tag icon={<GiftOutlined />} color="gold">
                    Bounty: {props.bounty}
                </Tag>
            )}
            {props.isInactive && <Tag icon={<InfoCircleOutlined />}>Inactive</Tag>}
        </Space>
    );
};
