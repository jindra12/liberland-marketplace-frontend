import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Space, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useIdentityByIdQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityCompaniesList } from "../lists/IdentityCompaniesList";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const identity = useIdentityByIdQuery({ id: id! });

    return (
        <Loader query={identity}>
            {(data) => (
                <Flex flex={1} vertical gap="8px">
                    <Space size={16} align="start" className="EntityDetail__header">
                        {data.Identity?.image?.url && (
                            <Avatar
                                shape="circle"
                                size={96}
                                src={`${BACKEND_URL}${data.Identity.image.url}`}
                            />
                        )}
                        <div>
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
                    <IdentityCompaniesList identityId={id!} />
                    <Divider />
                    <EntityCommentsSection
                        targetId={id!}
                        relationTo={Comment_ReplyPostRelationshipInputRelationTo.Identities}
                        title="Comments"
                    />
                </Flex>
            )}
        </Loader>
    );
};

export default IdentityDetail;
