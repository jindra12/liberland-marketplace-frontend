import * as React from "react";

import { useParams } from "react-router-dom";

import { GlobalOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Space, Typography } from "antd";

import { BACKEND_URL } from "../../gqlFetcher";
import { routes } from "../../routes";
import { useIdentityByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { getImage } from "../shared/image/utils";

import { CommonDetail } from "./CommonDetail";
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
                    <CommonDetail
                        className="IdentityDetail"
                        serverURL={data.Identity?.serverURL}
                        backTo={routes.tribes.route}
                        backLabel="Back to tribes"
                        shareLabel="Share this tribe"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        subscriptionTarget={{
                            collection: "identities",
                            targetID: data.Identity?.id ?? id!,
                            serverURL: data.Identity?.serverURL,
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
                                {data.Identity?.website && (
                                    <>
                                        <Button type="primary" href={data.Identity.website} target="_blank" rel="noreferrer">
                                            <GlobalOutlined /> {data.Identity.website}
                                        </Button>
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
                );
            }}
        </Loader>
    );
};

export default IdentityDetail;
