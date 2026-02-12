import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { RichText } from "@payloadcms/richtext-lexical/react";
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
                    {job.Job?.description && <RichText data={job.Job?.description} />}
                </>
            )}
        </Loader>
    );
};

export default JobDetail;
