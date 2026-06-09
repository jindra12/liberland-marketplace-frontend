import * as React from "react";

import { useEndpointPendingActionService } from "./EndpointPendingActionService/useEndpointPendingActionService";

export const EndpointPendingActionService: React.FunctionComponent = () => {
    useEndpointPendingActionService();

    return null;
};
