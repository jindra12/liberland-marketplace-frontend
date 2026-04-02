import * as React from "react";

import { HomeOutlined, MailOutlined, StopFilled } from "@ant-design/icons";
import { Avatar, Flex, Space, Tag, Typography, message } from "antd";

import { RouteButton } from "../RouteButton";

import type { UnsubscribeResolvedEntityProps } from "./types";
import { UnsubscribeEntityConfirmButton } from "./UnsubscribeEntityConfirmButton";
import { UnsubscribeEntitySuccessState } from "./UnsubscribeEntitySuccessState";

export const UnsubscribeEntityConfirmState: React.FunctionComponent<UnsubscribeResolvedEntityProps> = (
    props,
) => {
    const [messageApi, messageContextHolder] = message.useMessage();
    const [isComplete, setIsComplete] = React.useState(false);

    if (isComplete) {
        return (
            <>
                {messageContextHolder}
                <UnsubscribeEntitySuccessState entity={props.entity} params={props.params} />
            </>
        );
    }

    return (
        <>
            {messageContextHolder}
            <div className="UnsubscribePage">
                <div className="UnsubscribePage__card">
                    <Flex vertical gap={28}>
                        <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                            <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                            <Tag className="UnsubscribePage__statusTag">
                                {props.entity.typeLabel} updates
                            </Tag>
                        </Space>
                        <Flex gap={18} align="center" className="UnsubscribePage__hero">
                            <div className="UnsubscribePage__iconWrap">
                                <StopFilled />
                            </div>
                            <div>
                                <Typography.Title level={1} className="UnsubscribePage__title">
                                    Unsubscribe from {props.entity.title}?
                                </Typography.Title>
                                <Typography.Paragraph className="UnsubscribePage__description">
                                    You&apos;re about to stop receiving update emails for this{" "}
                                    {props.entity.typeLabel.toLowerCase()}. You can always subscribe
                                    again later from the listing itself.
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <div className="UnsubscribePage__entity">
                            <Avatar
                                size={72}
                                shape="square"
                                src={props.entity.imageURL || undefined}
                                className="UnsubscribePage__entityAvatar"
                            >
                                {props.entity.title.charAt(0).toUpperCase()}
                            </Avatar>
                            <div className="UnsubscribePage__entityBody">
                                <Typography.Text className="UnsubscribePage__entityType">
                                    {props.entity.typeLabel}
                                </Typography.Text>
                                <Typography.Title level={3} className="UnsubscribePage__entityTitle">
                                    {props.entity.title}
                                </Typography.Title>
                                {props.entity.summary ? (
                                    <Typography.Paragraph className="UnsubscribePage__entitySummary">
                                        {props.entity.summary}
                                    </Typography.Paragraph>
                                ) : null}
                            </div>
                        </div>
                        <div className="UnsubscribePage__meta">
                            <span className="UnsubscribePage__metaChip">
                                <MailOutlined />
                                <span>{props.params.email}</span>
                            </span>
                        </div>
                        <Space size={[12, 12]} wrap className="UnsubscribePage__actions">
                            <UnsubscribeEntityConfirmButton
                                entity={props.entity}
                                params={props.params}
                                messageApi={messageApi}
                                onComplete={() => {
                                    setIsComplete(true);
                                }}
                            />
                            <RouteButton
                                to={props.entity.detailPath}
                                icon={<HomeOutlined />}
                                className="UnsubscribePage__secondaryAction"
                            >
                                No, keep me subscribed
                            </RouteButton>
                        </Space>
                    </Flex>
                </div>
            </div>
        </>
    );
};
