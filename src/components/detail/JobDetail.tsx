import * as React from "react";
import { useParams } from "react-router-dom";
import { useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const JobDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const job = useJobByIdQuery({ id: id! });
    return (
        <Loader query={job}>
            {(job) => (

            )}
        </Loader>
    );
};

export default JobDetail;
