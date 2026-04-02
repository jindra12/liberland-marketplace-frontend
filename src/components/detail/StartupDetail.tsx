import * as React from "react";

import { useParams } from "react-router-dom";

import { useStartupByIdQuery } from "../hooks";
import { Loader } from "../Loader";

import { StartupDetailContent } from "./startupDetail/StartupDetailContent";

const StartupDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const startupQuery = useStartupByIdQuery({
        id: id!,
    });

    return (
        <Loader query={startupQuery}>
            {(data) => {
                if (!data.Startup) {
                    return null;
                }

                return <StartupDetailContent startup={data.Startup} startupId={id!} />;
            }}
        </Loader>
    );
};

export default StartupDetail;
