import * as React from "react";

import { useNavigate } from "react-router-dom";

import { CheckCircleFilled, HomeOutlined, MailOutlined, ReloadOutlined, StopFilled } from "@ant-design/icons";
import { Avatar, Button, Flex, Skeleton, Space, Tag, Typography, message } from "antd";
import { useTimeout } from "usehooks-ts";

import { useSubscriptionActions } from "../share/SubscribeButton/useSubscriptionActions";
import { getSubscriptionErrorMessage } from "../share/SubscribeButton/utils";

import type { UnsubscribeEntityProps } from "./types";
import { isAlreadyUnsubscribedError } from "./utils";

export const UnsubscribeEntity = <TData,>(props: UnsubscribeEntityProps<TData>) => {
    const navigate = useNavigate();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [isComplete, setIsComplete] = React.useState(false);
    const entity = props.query.data ? props.resolveEntity(props.query.data) : null;
    const { unsubscribe, isPending, entityLabel } = useSubscriptionActions({
        collection: props.params.collection,
        targetID: props.params.id,
        serverURL: entity?.serverURL,
    });
    useTimeout(
        () => {
            navigate("/");
        },
        isComplete ? 2200 : null,
    );
    const handleConfirm = async () => {
        if (!entity) {
            return;
        }
        try {
            await unsubscribe(props.params.email);
            messageApi.success(`You will no longer receive ${entityLabel} update emails for ${entity.title}.`);
            setIsComplete(true);
        } catch (error) {
            if (isAlreadyUnsubscribedError(error)) {
                messageApi.success(`That ${entityLabel} subscription had already been removed.`);
                setIsComplete(true);
                return;
            }
            messageApi.error(getSubscriptionErrorMessage(error, "unsubscribe", entityLabel));
        }
    };
    const handleRetryLookup = async () => {
        await props.query.refetch({
            throwOnError: false,
        });
    };
    const isLoading = props.query.isLoading || (props.query.isFetching && !props.query.data);
    if (isLoading) {
        return (
            <div className="UnsubscribePage">
                {messageContextHolder}
                <div className="UnsubscribePage__card UnsubscribePage__card--loading">
                    <Flex vertical gap={28}>
                        <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                            <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                            <Tag className="UnsubscribePage__statusTag">Checking link</Tag>
                        </Space>
                        <Flex gap={18} align="flex-start" className="UnsubscribePage__hero">
                            <Skeleton.Avatar active size={72} shape="square" />
                            <Flex vertical gap={12} flex={1}>
                                <Skeleton.Input active size="large" block />
                                <Skeleton
                                    active
                                    paragraph={{
                                        rows: 2,
                                        width: ["100%", "82%"],
                                    }}
                                    title={false}
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
                                paragraph={{
                                    rows: 2,
                                    width: ["94%", "72%"],
                                }}
                                title={false}
                            />
                        </Flex>
                    </Flex>
                </div>
            </div>
        );
    }
    if (props.query.error) {
        const errorMessage =
            props.query.error instanceof Error
                ? props.query.error.message
                : "We couldn't load the item behind this unsubscribe link.";
        return (
            <div className="UnsubscribePage">
                {messageContextHolder}
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
                                    {errorMessage}
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <Space size={[12, 12]} wrap className="UnsubscribePage__actions">
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                className="UnsubscribePage__primaryAction"
                                onClick={handleRetryLookup}
                            >
                                Retry lookup
                            </Button>
                            <Button
                                icon={<HomeOutlined />}
                                className="UnsubscribePage__secondaryAction"
                                onClick={() => navigate("/")}
                            >
                                Back to homepage
                            </Button>
                        </Space>
                    </Flex>
                </div>
            </div>
        );
    }
    if (!entity) {
        return (
            <div className="UnsubscribePage">
                {messageContextHolder}
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
                                    The unsubscribe link is valid, but the item behind it is no longer available.
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <Button
                            icon={<HomeOutlined />}
                            className="UnsubscribePage__secondaryAction"
                            onClick={() => navigate("/")}
                        >
                            Back to homepage
                        </Button>
                    </Flex>
                </div>
            </div>
        );
    }
    if (isComplete) {
        return (
            <div className="UnsubscribePage">
                {messageContextHolder}
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
                                    We won&apos;t send any more emails to {props.params.email} about {entity.title}.
                                    Redirecting you to the homepage now.
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <Space size={[12, 12]} wrap className="UnsubscribePage__actions">
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                className="UnsubscribePage__primaryAction"
                                onClick={() => navigate("/")}
                            >
                                Go to homepage
                            </Button>
                            <Button
                                className="UnsubscribePage__secondaryAction"
                                onClick={() => navigate(entity.detailPath)}
                            >
                                View {entity.typeLabel.toLowerCase()}
                            </Button>
                        </Space>
                    </Flex>
                </div>
            </div>
        );
    }
    return (
        <div className="UnsubscribePage">
            {messageContextHolder}
            <div className="UnsubscribePage__card">
                <Flex vertical gap={28}>
                    <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                        <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                        <Tag className="UnsubscribePage__statusTag">{entity.typeLabel} updates</Tag>
                    </Space>
                    <Flex gap={18} align="center" className="UnsubscribePage__hero">
                        <div className="UnsubscribePage__iconWrap">
                            <StopFilled />
                        </div>
                        <div>
                            <Typography.Title level={1} className="UnsubscribePage__title">
                                Unsubscribe from {entity.title}?
                            </Typography.Title>
                            <Typography.Paragraph className="UnsubscribePage__description">
                                You&apos;re about to stop receiving update emails for this{" "}
                                {entity.typeLabel.toLowerCase()}. You can always subscribe again later from the listing
                                itself.
                            </Typography.Paragraph>
                        </div>
                    </Flex>
                    <div className="UnsubscribePage__entity">
                        <Avatar
                            size={72}
                            shape="square"
                            src={!entity.imageURL ? undefined : entity.imageURL}
                            className="UnsubscribePage__entityAvatar"
                        >
                            {entity.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="UnsubscribePage__entityBody">
                            <Typography.Text className="UnsubscribePage__entityType">
                                {entity.typeLabel}
                            </Typography.Text>
                            <Typography.Title level={3} className="UnsubscribePage__entityTitle">
                                {entity.title}
                            </Typography.Title>
                            {entity.summary ? (
                                <Typography.Paragraph className="UnsubscribePage__entitySummary">
                                    {entity.summary}
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
                        <Button
                            type="primary"
                            className="UnsubscribePage__primaryAction"
                            onClick={handleConfirm}
                            loading={isPending}
                        >
                            Yes, unsubscribe me
                        </Button>
                        <Button
                            className="UnsubscribePage__secondaryAction"
                            onClick={() => navigate(entity.detailPath)}
                        >
                            No, keep me subscribed
                        </Button>
                    </Space>
                </Flex>
            </div>
        </div>
    );
};
