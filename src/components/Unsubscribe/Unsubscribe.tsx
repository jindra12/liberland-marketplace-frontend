import * as React from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { HomeOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Tag, Typography } from "antd";

import { routes } from "../../routes";
import type { NotificationTargetCollection } from "../share/SubscribeButton/types";

import type { ParsedUnsubscribeParams } from "./types";
import UnsubscribeCompany from "./UnsubscribeCompany";
import UnsubscribeIdentity from "./UnsubscribeIdentity";
import UnsubscribeJob from "./UnsubscribeJob";
import UnsubscribeProduct from "./UnsubscribeProduct";
import UnsubscribeStartup from "./UnsubscribeStartup";
import { parseUnsubscribeSearchParams } from "./utils";

type UnsubscribeRouteComponentProps = {
    params: ParsedUnsubscribeParams;
};

const UNSUBSCRIBE_ROUTE_COMPONENTS: Record<
    NotificationTargetCollection,
    React.FunctionComponent<UnsubscribeRouteComponentProps>
> = {
    companies: UnsubscribeCompany,
    identities: UnsubscribeIdentity,
    jobs: UnsubscribeJob,
    products: UnsubscribeProduct,
    startups: UnsubscribeStartup,
};

const Unsubscribe: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parsed = parseUnsubscribeSearchParams(searchParams);

    if (!parsed.isValid) {
        return (
            <div className="UnsubscribePage">
                <div className="UnsubscribePage__card UnsubscribePage__card--invalid">
                    <Flex vertical gap={28}>
                        <Space size={[10, 10]} wrap className="UnsubscribePage__kickerRow">
                            <span className="UnsubscribePage__eyebrow">Email Preferences</span>
                            <Tag className="UnsubscribePage__statusTag">Invalid link</Tag>
                        </Space>
                        <Flex gap={18} align="center" className="UnsubscribePage__hero">
                            <div className="UnsubscribePage__iconWrap">
                                <SafetyCertificateOutlined />
                            </div>
                            <div>
                                <Typography.Title level={1} className="UnsubscribePage__title">
                                    We couldn&apos;t trust this unsubscribe URL
                                </Typography.Title>
                                <Typography.Paragraph className="UnsubscribePage__description">
                                    {parsed.reason} For your safety, we only accept recognized notification types, safe
                                    item IDs, and valid email addresses.
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <Button
                            type="primary"
                            icon={<HomeOutlined />}
                            className="UnsubscribePage__primaryAction"
                            onClick={() => navigate(routes.home.route)}
                        >
                            Back to homepage
                        </Button>
                    </Flex>
                </div>
            </div>
        );
    }

    const Component = UNSUBSCRIBE_ROUTE_COMPONENTS[parsed.params.collection];
    return <Component params={parsed.params} />;
};

export default Unsubscribe;
