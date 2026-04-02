import * as React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Descriptions, Space, Tag } from "antd";
import { Link } from "react-router-dom";
type ProfileSummaryCardProps = {
    email?: string | null;
    emailVerified?: boolean;
    name?: string | null;
    picture?: string | null;
};
export const ProfileSummaryCard: React.FunctionComponent<ProfileSummaryCardProps> = (props) => {
    return (
        <Card className="Profile__info">
            <Space size={16} align="start">
                <Link to="/profile">
                    <Avatar size={64} src={props.picture} icon={<UserOutlined />} />
                </Link>
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">{props.name || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <Space>
                            {props.email || "—"}
                            {props.emailVerified ? <Tag color="success">Verified</Tag> : <Tag color="warning">Unverified</Tag>}
                        </Space>
                    </Descriptions.Item>
                </Descriptions>
            </Space>
        </Card>
    );
};
