import * as React from "react";

import { HomeOutlined, ReloadOutlined, StopFilled } from "@ant-design/icons";
import { Button, Flex, Space, Tag, Typography } from "antd";

import { RouteButton } from "../RouteButton";

import type { UnsubscribeLookupErrorStateProps } from "./types";

export const UnsubscribeEntityLookupErrorState: React.FunctionComponent<
    UnsubscribeLookupErrorStateProps
> = (props) => {
    return (
        <div className="UnsubscribePage">
            <div className="UnsubscribePage__card UnsubscribePage__card--invalid">
                <Flex vertical gap={28}>
                    <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                        <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                        <Tag className="UnsubscribePage__statusTag">Link unavailable</Tag>
                    </Space>
                    <Flex gap={18} align="center" className="UnsubscribePage__hero">
                        <div className="UnsubscribePage__iconWrap">
                            <StopFilled />
                        </div>
                        <div>
                            <Typography.Title level={1} className="UnsubscribePage__title">
                                We couldn&apos;t verify this unsubscribe request
                            </Typography.Title>
                            <Typography.Paragraph className="UnsubscribePage__description">
                                {props.errorMessage}
                            </Typography.Paragraph>
                        </div>
                    </Flex>
                    <Space size={[12, 12]} wrap className="UnsubscribePage__actions">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            className="UnsubscribePage__primaryAction"
                            onClick={props.onRetry}
                        >
                            Retry lookup
                        </Button>
                        <RouteButton
                            to="/"
                            icon={<HomeOutlined />}
                            className="UnsubscribePage__secondaryAction"
                        >
                            Back to homepage
                        </RouteButton>
                    </Space>
                </Flex>
            </div>
        </div>
    );
};
