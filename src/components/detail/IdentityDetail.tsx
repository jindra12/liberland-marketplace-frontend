import * as React from "react";
import { useParams } from "react-router-dom";
import { useIdentityByIdQuery, useJobByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const identity = useIdentityByIdQuery({ id: id! });
    return (
        <Loader query={identity}>
            {(identity) => (
                
            )}
        </Loader>
    );
};

export default IdentityDetail;
