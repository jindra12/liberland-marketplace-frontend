import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, List, Space, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListCompaniesQuery } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";

type CompanyItem = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];

type CompanyCardProps = {
    items: CompanyItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};

export const CompanyCard: React.FunctionComponent<CompanyCardProps> = ({
    items,
    loading,
    totalDocs,
    identityId,
}) => {
    const remaining = totalDocs !== undefined ? totalDocs - items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--companies"
            title={(
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/companies" className="SplashEntityCard__titleLink">Companies</Link>
                </Typography.Title>
            )}
        >
            <List
                className="SplashEntityCard__list"
                loading={loading}
                dataSource={items}
                locale={{ emptyText: "No companies for this tribe" }}
                renderItem={(company) => {
                    const imageUrl = company.image?.url;
                    return (
                        <List.Item
                            actions={[
                                (
                                    <Link key={`company-link-${company.id}`} to={`/companies/${company.id}`}>
                                        <Button>Details</Button>
                                    </Link>
                                ),
                            ]}
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={imageUrl ? (
                                        <Link to={`/companies/${company.id}`}>
                                            <Avatar
                                                shape="square"
                                                size={48}
                                                src={`${BACKEND_URL}${imageUrl}`}
                                                className="SplashEntityCard__avatar"
                                            />
                                        </Link>
                                    ) : undefined}
                                    title={(
                                        <Link to={`/companies/${company.id}`} className="SplashEntityCard__itemLink">
                                            {company.name}
                                        </Link>
                                    )}
                                />
                                <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                    {company.website && (
                                        <Typography.Link href={company.website} target="_blank" rel="noreferrer">
                                            Website
                                        </Typography.Link>
                                    )}
                                </Space>
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && identityId && (
                <Link to={`/companies?tribe=${identityId}`} className="SplashEntityCard__moreLink">
                    <Button type="link" icon={<RightOutlined />} iconPosition="end">
                        And +{remaining} more
                    </Button>
                </Link>
            )}
        </Card>
    );
};
