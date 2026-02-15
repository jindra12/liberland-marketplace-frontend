import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Divider, Grid, Space, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useIdentityByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityCompaniesList } from "../lists/IdentityCompaniesList";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const { md } = Grid.useBreakpoint();
    const identity = useIdentityByIdQuery({ id: id! });

    return (
        <Loader query={identity}>
            {(data) => (
                <div>
                    <Space size={16} align="start" className="EntityDetail__header">
                        {data.Identity?.image?.url && (
                            <Avatar
                                shape="circle"
                                size={md ? 128 : 96}
                                src={`${BACKEND_URL}${data.Identity.image.url}`}
                            />
                        )}
                        <div>
                            <Typography.Title level={1} className="EntityDetail__title">
                                {data.Identity?.name}
                            </Typography.Title>
                            {data.Identity?.website && (
                                <Typography.Link href={data.Identity.website} target="_blank" rel="noreferrer">
                                    <GlobalOutlined /> {data.Identity.website}
                                </Typography.Link>
                            )}
                        </div>
                    </Space>
                    <Divider />
                    <Markdown>{data.Identity?.description}</Markdown>
                    <Divider />
                    <div className="EntityDetail__subLists">
                        <IdentityCompaniesList identityId={id!} />
                    </div>
                </div>
            )}
        </Loader>
    );
};

export default IdentityDetail;
