import * as React from "react";

import { useNavigate } from "react-router-dom";

import { CheckCircleFilled, HomeOutlined } from "@ant-design/icons";
import { Flex, Space, Tag, Typography } from "antd";
import { useTimeout } from "usehooks-ts";

import { RouteButton } from "../RouteButton";

import type { UnsubscribeResolvedEntityProps } from "./types";

export const UnsubscribeEntitySuccessState: React.FunctionComponent<UnsubscribeResolvedEntityProps> = (
    props,
) => {
    const navigate = useNavigate();

    useTimeout(
        () => {
            navigate("/");
        },
        2200,
    );

    return (
        <div className="UnsubscribePage">
            <div className="UnsubscribePage__card UnsubscribePage__card--success">
                <Flex vertical gap={28}>
                    <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                        <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                        <Tag className="UnsubscribePage__statusTag">Unsubscribed</Tag>
                    </Space>
                    <Flex gap={18} align="center" className="UnsubscribePage__hero">
                        <div className="UnsubscribePage__iconWrap UnsubscribePage__iconWrap--success">
                            <CheckCircleFilled />
                        </div>
                        <div>
                            <Typography.Title level={1} className="UnsubscribePage__title">
                                You&apos;re all set
                            </Typography.Title>
                            <Typography.Paragraph className="UnsubscribePage__description">
                                We won&apos;t send any more emails to {props.params.email} about{" "}
                                {props.entity.title}. Redirecting you to the homepage now.
                            </Typography.Paragraph>
                        </div>
                    </Flex>
                    <Space size={[12, 12]} wrap className="UnsubscribePage__actions">
                        <RouteButton
                            to="/"
                            type="primary"
                            icon={<HomeOutlined />}
                            className="UnsubscribePage__primaryAction"
                        >
                            Go to homepage
                        </RouteButton>
                        <RouteButton
                            to={props.entity.detailPath}
                            className="UnsubscribePage__secondaryAction"
                        >
                            View {props.entity.typeLabel.toLowerCase()}
                        </RouteButton>
                    </Space>
                </Flex>
            </div>
        </div>
    );
};
