import * as React from "react";

import { Link } from "react-router-dom";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Descriptions, Flex, Tag, Typography } from "antd";

import { routes } from "../../routes";

type ProfileSummaryCardProps = {
    email?: string | null;
    emailVerified?: boolean;
    name?: string | null;
    picture?: string | null;
};
export const ProfileSummaryCard: React.FunctionComponent<ProfileSummaryCardProps> = (props) => {
    return (
        <Card className="Profile__info">
            <Flex gap={16} align="start" className="Profile__summary">
                <Link to={routes.profile.route}>
                    <Avatar size={64} src={props.picture} icon={<UserOutlined />} />
                </Link>
                <Descriptions column={1} size="small" className="Profile__summaryDetails">
                    <Descriptions.Item label="Name">{props.name || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <Flex wrap gap={8} align="center" className="Profile__summaryEmail">
                            <Typography.Text className="Profile__email">{props.email || "—"}</Typography.Text>
                            {props.emailVerified ? (
                                <Tag color="success">Verified</Tag>
                            ) : (
                                <Tag color="warning">Unverified</Tag>
                            )}
                        </Flex>
                    </Descriptions.Item>
                </Descriptions>
            </Flex>
        </Card>
    );
};
