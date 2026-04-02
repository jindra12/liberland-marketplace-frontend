import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Card, Grid, List, Space, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { ListCompaniesQuery } from "../../generated/graphql";
import { getImage } from "../../utils";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";
import { RouteButton } from "../RouteButton";
type CompanyItem = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];
type CompanyCardProps = {
    items: CompanyItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const CompanyCard: React.FunctionComponent<CompanyCardProps> = (props) => {
    const { xl } = Grid.useBreakpoint();
    const remaining = props.totalDocs !== undefined ? props.totalDocs - props.items.length : 0;
    return (
        <Card
            className="SplashEntityCard SplashEntityCard--companies"
            title={
                <Typography.Title level={3} className="SplashEntityCard__title">
                    <Link to="/companies" className="SplashEntityCard__titleLink">
                        Companies
                    </Link>
                </Typography.Title>
            }
        >
            <List
                className="SplashEntityCard__list"
                loading={props.loading}
                dataSource={props.items}
                locale={{
                    emptyText: "Coming soon!",
                }}
                renderItem={(company) => {
                    const imageSrc = getImage(company);
                    return (
                        <List.Item
                            actions={
                                xl
                                    ? [
                                          <SplashShareDetailActionRow
                                              key={`company-actions-${company.id}`}
                                              detailPath={`/companies/${company.id}`}
                                              title={company.name || "Company"}
                                              text={`Check out ${company.name} on NSwap.`}
                                          />,
                                      ]
                                    : undefined
                            }
                        >
                            <div className="SplashEntityCard__itemBody">
                                <List.Item.Meta
                                    avatar={
                                        imageSrc ? (
                                            <Link to={`/companies/${company.id}`}>
                                                <Avatar shape="square" size={48} src={imageSrc} className="SplashEntityCard__avatar" />
                                            </Link>
                                        ) : null
                                    }
                                    title={
                                        <Link to={`/companies/${company.id}`} className="SplashEntityCard__itemLink">
                                            {company.name}
                                        </Link>
                                    }
                                />
                                <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                                    {company.website && (
                                        <Typography.Link href={company.website} target="_blank" rel="noreferrer">
                                            Website
                                        </Typography.Link>
                                    )}
                                </Space>
                                {!xl && <SplashShareDetailActionRow detailPath={`/companies/${company.id}`} title={company.name || "Company"} text={`Check out ${company.name} on NSwap.`} />}
                            </div>
                        </List.Item>
                    );
                }}
            />
            {remaining > 0 && props.identityId && (
                <RouteButton to={`/companies?tribe=${props.identityId}`} type="link" icon={<RightOutlined />} iconPosition="end" className="SplashEntityCard__moreLink">
                    And +{remaining} more
                </RouteButton>
            )}
        </Card>
    );
};
