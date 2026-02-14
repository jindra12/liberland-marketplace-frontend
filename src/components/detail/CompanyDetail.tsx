import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Divider, Flex, Space, Tag, Typography } from "antd";
import {
    GlobalOutlined,
    MailOutlined,
    MinusCircleFilled,
    PhoneOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyJobsSubList } from "./sublists/CompanyJobsSubList";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    return (
        <Loader query={company}>
            {(data) => {
                const companyData = data.Company;
                const imageUrl = companyData?.image?.url || companyData?.identity?.image?.url;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];

                return (
                <div>
                    <Space size={16} align="start" className="EntityDetail__header">
                        {imageUrl && (
                            <Avatar
                                shape="circle"
                                size={128}
                                src={`${BACKEND_URL}${imageUrl}`}
                            />
                        )}
                        <div>
                            <Typography.Title level={1} className="EntityDetail__title">
                                {companyData?.name}
                            </Typography.Title>
                            <Space size={[8, 8]} wrap className="EntityDetail__meta">
                                {companyData?.identity?.name && (
                                    <Link to={`/identities/${companyData.identity.id}`}>
                                        <Tag color="success" icon={<UsergroupAddOutlined />}>
                                            {companyData.identity.name}
                                        </Tag>
                                    </Link>
                                )}
                                {companyData?.website && (
                                    <Typography.Link
                                        href={companyData.website}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <GlobalOutlined /> {companyData.website}
                                    </Typography.Link>
                                )}
                                {companyData?.email && (
                                    <Typography.Link href={`mailto:${companyData.email}`}>
                                        <MailOutlined /> {companyData.email}
                                    </Typography.Link>
                                )}
                                {companyData?.phone && (
                                    <Typography.Link href={`tel:${companyData.phone}`}>
                                        <PhoneOutlined /> {companyData.phone}
                                    </Typography.Link>
                                )}
                            </Space>
                        </div>
                    </Space>
                    <Divider />
                    <Markdown>{companyData?.description}</Markdown>
                    <Divider />
                    <Flex wrap gap="24px" className="EntityDetail__identityGroups">
                        <div className="EntityDetail__identityGroup">
                            <Flex gap="8px" align="center" className="EntityDetail__identityGroupTitle">
                                <UsergroupAddOutlined />
                                <Typography.Text strong>Allowed identities</Typography.Text>
                            </Flex>
                            <Space size={[8, 8]} wrap>
                                {allowedIdentities.length ? allowedIdentities.map((identity) => (
                                    <Link key={`allowed-${identity.id}`} to={`/identities/${identity.id}`}>
                                        <Tag color="success">{identity.name}</Tag>
                                    </Link>
                                )) : <Typography.Text type="secondary">No allowed identities</Typography.Text>}
                            </Space>
                        </div>
                        <div className="EntityDetail__identityGroup">
                            <Flex gap="8px" align="center" className="EntityDetail__identityGroupTitle">
                                <MinusCircleFilled />
                                <Typography.Text strong>Disallowed identities</Typography.Text>
                            </Flex>
                            <Space size={[8, 8]} wrap>
                                {disallowedIdentities.length ? disallowedIdentities.map((identity) => (
                                    <Link key={`disallowed-${identity.id}`} to={`/identities/${identity.id}`}>
                                        <Tag color="error">{identity.name}</Tag>
                                    </Link>
                                )) : <Typography.Text type="secondary">No disallowed identities</Typography.Text>}
                            </Space>
                        </div>
                    </Flex>
                    <Divider />
                    <CompanyJobsSubList companyId={id!} />
                </div>
                );
            }}
        </Loader>
    );
};

export default CompanyDetail;
