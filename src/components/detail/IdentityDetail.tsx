import * as React from "react";

import { useParams } from "react-router-dom";

import { GlobalOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Space, Tabs, Typography } from "antd";

import { BACKEND_URL } from "../../gqlFetcher";
import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { useIdentityByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { DetailShareSection } from "../share/DetailShareSection";
import { getImage } from "../shared/image/utils";

import { DetailBackButton } from "./DetailBackButton";
import { IdentityCompaniesTab } from "./identityDetail/IdentityCompaniesTab";
import { IdentityJobsTab } from "./identityDetail/IdentityJobsTab";
import { IdentityProductsTab } from "./identityDetail/IdentityProductsTab";
import { IdentityVenturesTab } from "./identityDetail/IdentityVenturesTab";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const identity = useIdentityByIdQuery({ id: id!, url: BACKEND_URL });

    return (
        <Loader query={identity}>
            {(data) => {
                const imageSrc = getImage(data.Identity);
                const shareTitle = data.Identity?.name ?? "Tribe";
                const shareText = `Check out ${shareTitle} on NSwap.`;
                return (
                    <Flex flex={1} vertical gap={12} className="EntityDetail IdentityDetail">
                        <DetailPageTracker serverUrl={data.Identity?.serverURL} />
                        <DetailBackButton to="/tribes" label="Back to tribes" />
                        <Space size={16} align="start" className="EntityDetail__header">
                            {imageSrc && <Avatar shape="circle" size={96} src={imageSrc} />}
                            <div className="EntityDetail__headerBody">
                                <Typography.Title level={1} className="EntityDetail__title">
                                    {data.Identity?.name}
                                </Typography.Title>
                            </div>
                        </Space>
                        {data.Identity?.website && (
                            <>
                                <Divider />
                                <Button type="primary" href={data.Identity.website} target="_blank" rel="noreferrer">
                                    <GlobalOutlined /> {data.Identity.website}
                                </Button>
                            </>
                        )}
                        <Divider />
                        <Markdown>{data.Identity?.description}</Markdown>
                        <Divider />
                        <DetailShareSection
                            label="Share this tribe"
                            title={shareTitle}
                            text={shareText}
                            subscriptionTarget={
                                {
                                    collection: "identities",
                                    targetID: data.Identity?.id ?? id!,
                                    serverURL: data.Identity?.serverURL,
                                    isSubscribed: data.Identity?.isSubscribed,
                                }
                            }
                        />
                        <Divider />
                        <Tabs
                            className="EntityDetail__tabs IdentityDetail__tabs"
                            defaultActiveKey="products"
                            items={[
                                {
                                    key: "products",
                                    label: "Products",
                                    children: (
                                        <IdentityProductsTab
                                            identityId={data.Identity?.id ?? id!}
                                            serverURL={data.Identity?.serverURL}
                                        />
                                    ),
                                },
                                {
                                    key: "jobs",
                                    label: "Jobs",
                                    children: (
                                        <IdentityJobsTab
                                            identityId={data.Identity?.id ?? id!}
                                            serverURL={data.Identity?.serverURL}
                                        />
                                    ),
                                },
                                {
                                    key: "companies",
                                    label: "Companies",
                                    children: (
                                        <IdentityCompaniesTab
                                            identityId={data.Identity?.id ?? id!}
                                            serverURL={data.Identity?.serverURL}
                                        />
                                    ),
                                },
                                {
                                    key: "ventures",
                                    label: "Ventures",
                                    children: (
                                        <IdentityVenturesTab
                                            identityId={data.Identity?.id ?? id!}
                                            serverURL={data.Identity?.serverURL}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default IdentityDetail;
