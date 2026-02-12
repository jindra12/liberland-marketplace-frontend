import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "antd";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useListJobsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";

export interface JobListProps {
    limited?: boolean;
}

export const JobList: React.FunctionComponent<JobListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListJobsQuery({
        limit: 10,
        page,
    });
    const items = query.data?.Jobs?.docs || [];
    
    return (
        <AppList
            hasMore={!props.limited && (!query.data?.Jobs || query.data.Jobs.hasNextPage)}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            renderItem={{
                title: (job) => job.title,
                actions: (job) => <Link to={`/jobs/${job.id}`}>Details</Link>,
                avatar: (job) => job.image?.url ? <Avatar src={job.image.url} /> : undefined,
                description: (job) => job.description ? <RichText data={job.description} /> : null,
            }}
        />
    );
};
