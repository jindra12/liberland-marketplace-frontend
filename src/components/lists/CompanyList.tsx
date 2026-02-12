import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, List, Typography } from "antd";
import { useListCompaniesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";

export const CompanyList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListCompaniesQuery({
        limit: 10,
        page,
    });
    const items = query.data?.Companies?.docs || [];
    
    return (
        <AppList
            hasMore={!query.data?.Companies || query.data.Companies.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            renderItem={{
                title: (company) => company.name,
                actions: (company) => <Link to={`/companies/${company.id}`}>Details</Link>,
                avatar: (company) => company.image?.url ? <Avatar src={`${BACKEND_URL}${company.image.url}`} /> : undefined,
                body: (company) => {
                    const email = company.email ? <Typography.Link href={`mailto:${company.email}`}>{company.email}</Typography.Link> : undefined;
                    const website = company.website ? <Typography.Link href={company.website}>{company.website}</Typography.Link> : undefined;
                    const phone = company.website ? <Typography.Link href={`tel:${company.phone}`}>{company.phone}</Typography.Link> : undefined;
                    return (
                        <List
                            dataSource={[email, website, phone].filter(Boolean)}
                            itemLayout="vertical"
                            locale={{ emptyText: "No contacts found" }}
                            renderItem={(item) => <List.Item>{item}</List.Item>}
                        />
                    )
                },
            }}
        />
    );
};