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
                <>
                    <Typography.Title level={1}>{job.Job?.title}</Typography.Title>
                    <Typography.Paragraph>{job.Job?.description || "This is a job that people can apply on, that the creator didnt bother making a description for"}</Typography.Paragraph>
                </>
            )}
        </Loader>
    );
};

export default JobDetail;
