import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useIdentityByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const identity = useIdentityByIdQuery({ id: id! });
    return (
        <Loader query={identity}>
            {(identity) => (
                <div>
                    <Typography.Title level={1}>{identity.Identity?.name}</Typography.Title>
                    <Markdown>{identity.Identity?.description}</Markdown>
                </div>
            )}
        </Loader>
    );
};

export default IdentityDetail;
