import * as React from "react";

import { useEndpointContext } from "./EndpointContext";
import { EndpointPendingActionService } from "./EndpointPendingActionService";

export const EndpointPendingActionHost: React.FunctionComponent = () => {
    const { authUrl } = useEndpointContext();

    return <EndpointPendingActionService key={authUrl} />;
};

