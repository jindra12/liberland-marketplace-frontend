import * as React from "react";

import { useParams } from "react-router-dom";

import { decodeServerUrlSegment } from "../routes";

import { useEndpointContext } from "./EndpointContext";
import { ServerUrlGuardContent } from "./ServerUrlGuardContent";

export const ServerUrlGuard: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const params = useParams<{ serverUrl?: string }>();
    const { enabled, isSyndicationLoading, setUrls } = useEndpointContext();
    const serverURL = decodeServerUrlSegment(params.serverUrl ?? "");
    const displayServerURL = serverURL || params.serverUrl || "Unknown server URL";
    const isTrusted = Boolean(serverURL) && enabled.includes(serverURL);

    return (
        <ServerUrlGuardContent
            decodedServerURL={serverURL}
            isLoading={isSyndicationLoading}
            isTrusted={isTrusted}
            displayServerURL={displayServerURL}
            setUrls={setUrls}
        >
            {props.children}
        </ServerUrlGuardContent>
    );
};
