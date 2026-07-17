import * as React from "react";

import { EndpointContext } from "../../../src/components/EndpointContext";
import type { EndpointPendingAction } from "../../../src/components/EndpointAuthAction/types";
import { MAIN_SERVER_URL } from "./constants";
import type { URL as EndpointURL } from "../../../src/types";

const defaultUrls: EndpointURL[] = [
    {
        enabled: true,
        value: MAIN_SERVER_URL,
        name: "Main",
    },
];

export const TestEndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [authUrl, setAuthUrl] = React.useState(MAIN_SERVER_URL);
    const [pendingAction, setPendingAction] = React.useState<EndpointPendingAction | undefined>();

    return (
        <EndpointContext.Provider
            value={{
                urls: defaultUrls,
                enabled: defaultUrls.filter(({ enabled }) => enabled).map(({ value }) => value),
                isSyndicationLoading: false,
                setUrls: () => undefined,
                authUrl,
                setAuthUrl,
                pendingAction,
                setPendingAction,
            }}
        >
            {props.children}
        </EndpointContext.Provider>
    );
};
