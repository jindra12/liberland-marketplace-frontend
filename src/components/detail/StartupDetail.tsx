import * as React from "react";

import { useParams } from "react-router-dom";

import { decodeServerUrlSegment } from "../../routes";
import { useStartupByIdQuery } from "../hooks";
import { Loader } from "../Loader";

import { StartupDetailContent } from "./startupDetail/StartupDetailContent";

const StartupDetail: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const startupQuery = useStartupByIdQuery({
        id: id!,
        url: routeServerURL,
    });

    return (
        <Loader query={startupQuery}>
            {(data) => {
                if (!data.Startup) {
                    return null;
                }

                return (
                    <StartupDetailContent
                        startup={data.Startup}
                        startupId={id!}
                        serverURL={data.Startup.serverURL ?? routeServerURL}
                    />
                );
            }}
        </Loader>
    );
};

export default StartupDetail;
