import * as React from "react";

import { Flex, Skeleton, Space, Tag } from "antd";

export const UnsubscribeEntityLoadingState: React.FunctionComponent = () => {
    return (
        <div className="UnsubscribePage">
            <div className="UnsubscribePage__card UnsubscribePage__card--loading">
                <Flex vertical gap={28}>
                    <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                        <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                        <Tag className="UnsubscribePage__statusTag">Checking link</Tag>
                    </Space>
                    <Flex gap={18} align="flex-start" className="UnsubscribePage__hero">
                        <Skeleton.Avatar active size={72} shape="square" />
                        <Flex vertical gap={12} flex={1}>
                            <Skeleton.Input active block size="large" />
                            <Skeleton
                                active
                                title={false}
                                paragraph={{
                                    rows: 2,
                                    width: ["100%", "82%"],
                                }}
                            />
                        </Flex>
                    </Flex>
                    <Flex vertical gap={12} className="UnsubscribePage__loadingRow">
                        <Skeleton.Input
                            active
                            size="small"
                            style={{
                                width: 220,
                            }}
                        />
                        <Skeleton
                            active
                            title={false}
                            paragraph={{
                                rows: 2,
                                width: ["94%", "72%"],
                            }}
                        />
                    </Flex>
                </Flex>
            </div>
        </div>
    );
};
