import * as React from "react";

import { Link } from "react-router-dom";

import { UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Space, Typography } from "antd";

import { Company, ListCompaniesQuery } from "../../generated/graphql";
import { routes } from "../../routes";
import { useDislikeCompanyMutation, useLikeCompanyMutation } from "../hooks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { SplashCard } from "./SplashCard";
import { SplashCardItem } from "./SplashCardItem";
import { SplashShareDetailActionRow } from "./SplashShareDetailActionRow";

type CompanyItem = NonNullable<NonNullable<ListCompaniesQuery["Companies"]>["docs"]>[number];
type CompanyCardProps = {
    items: CompanyItem[];
    loading?: boolean;
};

export const CompanyCard: React.FunctionComponent<CompanyCardProps> = (props) => {
    const likeMutation = useLikeCompanyMutation();
    const dislikeMutation = useDislikeCompanyMutation();

    return (
        <SplashCard
            className="SplashEntityCard--companies"
            items={props.items}
            loading={props.loading}
            renderItem={(company) => {
                const imageSrc = getImage(company);
                const detailPath = routes.companies.detail.getLink(company as Company);

                return (
                    <SplashCardItem
                        id={company.id}
                        detailPath={detailPath}
                        title={company.name || "Company"}
                        avatar={
                            imageSrc ? (
                                <Link to={detailPath}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={imageSrc}
                                        className="SplashEntityCard__avatar"
                                    />
                                </Link>
                            ) : null
                        }
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
                                detailPath={detailPath}
                                title={company.name || "Company"}
                                text={`Check out ${company.name} on NSwap.`}
                            />,
                        ]}
                    >
                        <Space size={[6, 6]} wrap className="SplashEntityCard__meta">
                            {company.identity && (
                                <IdentityTagLink
                                    identity={company.identity}
                                    color="success"
                                    icon={<UsergroupAddOutlined />}
                                />
                            )}
                        </Space>
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
