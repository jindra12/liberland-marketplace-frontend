import * as React from "react";

import { Col, Row, Typography } from "antd";

import type { CompanyByIdQuery } from "../../../generated/graphql";
import { Markdown } from "../../Markdown";
import { CompanyContactLinks } from "../../shared/CompanyContactLinks";
import { IdentityGroups } from "../IdentityGroups";
import type { useCompanyTabCounts } from "../useCompanyTabCounts";

import { CompanyOverviewListings } from "./CompanyOverviewListings";

interface CompanyOverviewProps {
    company: NonNullable<CompanyByIdQuery["Company"]>;
    listings: ReturnType<typeof useCompanyTabCounts>;
}

export const CompanyOverview: React.FunctionComponent<CompanyOverviewProps> = (props) => (
    <Row gutter={[32, 24]} className="CompanyOverview">
        <Col xs={24} lg={16}>
            <Typography.Title level={2}>About</Typography.Title>
            <Markdown>{props.company.description}</Markdown>
            <CompanyOverviewListings jobs={props.listings.jobsQuery} products={props.listings.productsQuery} />
        </Col>
        <Col xs={24} lg={8}>
            <CompanyContactLinks
                website={props.company.website}
                email={props.company.email}
                phone={props.company.phone}
                className="CompanyOverview__contacts"
            />
            <IdentityGroups
                allowedIdentities={props.company.allowedIdentities}
                disallowedIdentities={props.company.disallowedIdentities}
                className="CompanyOverview__tribes"
            />
        </Col>
    </Row>
);
