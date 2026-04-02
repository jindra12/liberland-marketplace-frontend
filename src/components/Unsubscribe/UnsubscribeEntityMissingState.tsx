import * as React from "react";

import { HomeOutlined, StopFilled } from "@ant-design/icons";
import { Flex, Space, Tag, Typography } from "antd";

import { RouteButton } from "../RouteButton";

export const UnsubscribeEntityMissingState: React.FunctionComponent = () => {
    return (
        <div className="UnsubscribePage">
            <div className="UnsubscribePage__card UnsubscribePage__card--invalid">
                <Flex vertical gap={28}>
                    <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                        <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                        <Tag className="UnsubscribePage__statusTag">Item missing</Tag>
                    </Space>
                    <Flex gap={18} align="center" className="UnsubscribePage__hero">
                        <div className="UnsubscribePage__iconWrap">
                            <StopFilled />
                        </div>
                        <div>
                            <Typography.Title level={1} className="UnsubscribePage__title">
                                We couldn&apos;t find this item anymore
                            </Typography.Title>
                            <Typography.Paragraph className="UnsubscribePage__description">
                                The unsubscribe link is valid, but the item behind it is no longer
                                available.
                            </Typography.Paragraph>
                        </div>
                    </Flex>
                    <RouteButton
                        to="/"
                        icon={<HomeOutlined />}
                        className="UnsubscribePage__secondaryAction"
                    >
                        Back to homepage
                    </RouteButton>
                </Flex>
            </div>
        </div>
    );
};
