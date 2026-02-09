import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const job = useJobByIdQuery({ id: id! });
    return (
        <Loader query={job}>
            {(job) => (
                <Typography.Title level={1}>{job.Job?.title}</Typography.Title>
            )}
        </Loader>
    );
};

export default JobDetail;
