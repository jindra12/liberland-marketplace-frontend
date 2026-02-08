import * as React from "react";
import { useListJobsQuery } from "../../generated/graphql";

export const JobList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListJobsQuery({
        limit: 10,
        page,
    });
    return (
        
    );
};