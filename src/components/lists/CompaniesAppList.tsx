import * as React from "react";
import { Link } from "react-router-dom";
import { Typography } from "antd";
import uniqBy from "lodash-es/uniqBy";
import { ListCompaniesByIdentityQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { EntitySubListSection } from "./EntitySubListSection";
import { Markdown } from "../Markdown";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityAccessTags } from "../shared/IdentityAccessTags";

type CompanyItem = NonNullable<NonNullable<ListCompaniesByIdentityQuery["Companies"]>["docs"]>[number];

type CompaniesAppListProps = {
    title: string;
    items: CompanyItem[];
    hasMore: boolean;
    next: () => void;
    refetch: () => void;
    emptyText: string;
};

export const CompaniesAppList: React.FunctionComponent<CompaniesAppListProps> = (props) => {
    return (
        <EntitySubListSection title={props.title}>
            <AppList
                items={props.items}
                hasMore={props.hasMore}
                next={props.next}
                refetch={props.refetch}
                title="Companies"
                emptyText={props.emptyText}
                renderItem={{
                    title: (company) => (
                        <Typography.Text strong className="EntitySubList__itemTitle">
                            <Link to={`/companies/${company.id}`}>{company.name}</Link>
                        </Typography.Text>
                    ),
                    description: (company) => (
                        <Markdown className="Markdown--clamp2 EntitySubList__description">
                            {company.description}
                        </Markdown>
                    ),
                    body: (company) => {
                        const allowedIdentities = uniqBy(company.allowedIdentities || [], "id");
                        const disallowedIdentities = uniqBy(company.disallowedIdentities || [], "id");
                        const companyIdentity = company.identity?.name ? {
                            id: company.identity.id,
                            name: company.identity.name,
                        } : undefined;

                        return (
                            <>
                                <CompanyContactLinks
                                    identity={companyIdentity}
                                    website={company.website}
                                    email={company.email}
                                    phone={company.phone}
                                    className="EntitySubList__meta"
                                />
                                <IdentityAccessTags
                                    allowedIdentities={allowedIdentities}
                                    disallowedIdentities={disallowedIdentities}
                                    className="EntitySubList__identities"
                                    hideWhenEmpty
                                    keyPrefix={company.id}
                                />
                            </>
                        );
                    },
                    actions: (company) => <Link to={`/companies/${company.id}`}>Details</Link>,
                }}
            />
        </EntitySubListSection>
    );
};
