import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Grid, List, Space, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListCompaniesQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

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
    const { md } = Grid.useBreakpoint();
    const navigate = useNavigate();
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
                locale={{ emptyText: "Coming soon!" }}
                renderItem={(company) => {
                    const imageSrc = getImage(company);

                    return (
                        <List.Item
                            actions={md ? [(
                                <SplashShareDetailActionRow
                                    key={`company-actions-${company.id}`}
                                    detailPath={`/companies/${company.id}`}
                                    title={company.name || "Company"}
                                    text={`Check out ${company.name} on NSwap.`}
                                    onDetailsClick={() => navigate(`/companies/${company.id}`)}
                                />
                            )] : undefined}
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={imageSrc ? (
                                        <Link to={`/companies/${company.id}`}>
                                            <Avatar
                                                shape="square"
                                                size={48}
                                                src={imageSrc}
                                                className="SplashEntityCard__avatar"
                                            />
                                        </Link>
                                    ) : null}
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
                                {!md && (
                                    <SplashShareDetailActionRow
                                        detailPath={`/companies/${company.id}`}
                                        title={company.name || "Company"}
                                        text={`Check out ${company.name} on NSwap.`}
                                        onDetailsClick={() => navigate(`/companies/${company.id}`)}
                                    />
                                )}
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
