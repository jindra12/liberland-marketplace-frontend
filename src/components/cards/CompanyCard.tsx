import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, List, Space, Typography } from "antd";

import { ListCompaniesQuery } from "../../generated/graphql";
import { useDislikeCompanyMutation, useLikeCompanyMutation } from "../hooks";
import { getImage } from "../shared/image/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type CompanyItem = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];
type CompanyCardProps = {
    items: CompanyItem[];
    loading?: boolean;
    totalDocs?: number;
    identityId?: string;
};
export const CompanyCard: React.FunctionComponent<CompanyCardProps> = (props) => {
    const likeMutation = useLikeCompanyMutation();
    const dislikeMutation = useDislikeCompanyMutation();
    return (
        <SplashCard
            className="SplashEntityCard--companies"
            title="Companies"
            titleRoute="/companies"
            items={props.items}
            loading={props.loading}
            totalDocs={props.totalDocs}
            identityId={props.identityId}
            buildMoreLinkRoute={(identityId) => `/companies?tribe=${identityId}`}
            renderItem={(company) => {
                const imageSrc = getImage(company);
                return (
                    <SplashCardItem
                        id={company.id}
                        liked={company.hasLiked}
                        likeCount={company.likeCount}
                        serverURL={company.serverURL}
                        likeActions={{
                            likeMutation,
                            dislikeMutation,
                        }}
                        actions={[
                            <SplashShareDetailActionRow
                                key={`company-actions-${company.id}`}
                                detailPath={`/companies/${company.id}`}
                                title={company.name || "Company"}
                                text={`Check out ${company.name} on NSwap.`}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                imageSrc ? (
                                    <Link to={`/companies/${company.id}`}>
                                        <Avatar
                                            shape="square"
                                            size={48}
                                            src={imageSrc}
                                            className="SplashEntityCard__avatar"
                                        />
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
                        </SplashCardItem>
                    );
                }}
        />
    );
};
