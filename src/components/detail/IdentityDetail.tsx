import * as React from "react";

import { useParams } from "react-router-dom";

import { GlobalOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Space, Typography } from "antd";

import { decodeServerUrlSegment, routes } from "../../routes";
import { useIdentityByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { getImage } from "../shared/image/utils";

import { CommonDetail } from "./CommonDetail";
import { IdentityCompaniesTab } from "./identityDetail/IdentityCompaniesTab";
import { IdentityJobsTab } from "./identityDetail/IdentityJobsTab";
import { IdentityProductsTab } from "./identityDetail/IdentityProductsTab";
import { IdentitySyndicationLink } from "./identityDetail/IdentitySyndicationLink";
import { IdentityVenturesTab } from "./identityDetail/IdentityVenturesTab";

const IdentityDetail: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const identity = useIdentityByIdQuery({ id: id!, url: routeServerURL });

    return (
        <Loader query={identity}>
            {(data) => {
                const imageSrc = getImage(data.Identity);
                const shareTitle = data.Identity?.name ?? "Tribe";
                const shareText = `Check out ${shareTitle} on NSwap.`;
                const currentServerURL = data.Identity?.serverURL ?? routeServerURL;
                return (
                    <CommonDetail
                        className="IdentityDetail"
                        serverURL={currentServerURL}
                        backTo={routes.tribes.route}
                        backLabel="Back to tribes"
                        shareLabel="Share this tribe"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        subscriptionTarget={{
                            collection: "identities",
                            targetID: data.Identity?.id ?? id!,
                            serverURL: currentServerURL,
                            isSubscribed: data.Identity?.isSubscribed,
                        }}
                        header={
                            <Space size={16} align="start" className="EntityDetail__header">
                                {imageSrc && <Avatar shape="circle" size={96} src={imageSrc} />}
                                <div className="EntityDetail__headerBody">
                                    <Typography.Title level={1} className="EntityDetail__title">
                                        {data.Identity?.name}
                                    </Typography.Title>
                                </div>
                            </Space>
                        }
                        beforeShare={
                            <>
                                <Flex vertical gap={12} align="flex-start">
                                    {data.Identity?.website && (
                                        <Button type="primary" href={data.Identity.website} target="_blank" rel="noreferrer">
                                            <GlobalOutlined /> {data.Identity.website}
                                        </Button>
                                    )}
                                    <IdentitySyndicationLink serverURL={currentServerURL} />
                                </Flex>
                                {(data.Identity?.website || currentServerURL) && (
                                    <>
                                        <Divider />
                                    </>
                                )}
                                <Markdown>{data.Identity?.description}</Markdown>
                            </>
                        }
                        sections={[
                            {
                                key: "products",
                                label: "Products",
                                children: (
                                    <IdentityProductsTab
                                        identityId={data.Identity?.id ?? id!}
                                        serverURL={currentServerURL}
                                    />
                                ),
                            },
                            {
                                key: "jobs",
                                label: "Jobs",
                                children: (
                                    <IdentityJobsTab
                                        identityId={data.Identity?.id ?? id!}
                                        serverURL={currentServerURL}
                                    />
                                ),
                            },
                            {
                                key: "companies",
                                label: "Companies",
                                children: (
                                    <IdentityCompaniesTab
                                        identityId={data.Identity?.id ?? id!}
                                        serverURL={currentServerURL}
                                    />
                                ),
                            },
                            {
                                key: "ventures",
                                label: "Ventures",
                                children: (
                                    <IdentityVenturesTab
                                        identityId={data.Identity?.id ?? id!}
                                        serverURL={currentServerURL}
                                    />
                                ),
                            },
                        ]}
                    />
                );
            }}
        </Loader>
    );
};

export default IdentityDetail;
