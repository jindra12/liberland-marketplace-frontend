import * as React from "react";

import { EndpointContext } from "../../../src/components/EndpointContext";
import type { EndpointPendingAction } from "../../../src/components/EndpointAuthAction/types";
import { AUTH_URL_STORAGE_KEY } from "../../../src/components/endpoints/constants";
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
    const [urls, setUrls] = React.useState<EndpointURL[]>(() => {
        const storedUrls = window.localStorage.getItem("endpoints.urls");
        if (storedUrls === null) {
            return defaultUrls;
        }

        try {
            const parsedUrls = JSON.parse(storedUrls) as EndpointURL[];

            return Array.isArray(parsedUrls) && parsedUrls.length > 0 ? parsedUrls : defaultUrls;
        } catch {
            return defaultUrls;
        }
    });
    const [authUrl, setAuthUrlState] = React.useState<string>(() => {
        const storedAuthUrl = window.localStorage.getItem(AUTH_URL_STORAGE_KEY);
        if (storedAuthUrl !== null) {
            try {
                const parsedAuthUrl = JSON.parse(storedAuthUrl) as string;
                if (urls.some(({ value }) => value === parsedAuthUrl)) {
                    return parsedAuthUrl;
                }
            } catch {
                return urls[0]?.value || MAIN_SERVER_URL;
            }
        }

        return urls[0]?.value || MAIN_SERVER_URL;
    });
    const [pendingAction, setPendingAction] = React.useState<EndpointPendingAction | undefined>();

    const setAuthUrl = React.useCallback((nextAuthUrl: string) => {
        setAuthUrlState(nextAuthUrl);
        window.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(nextAuthUrl));
    }, []);

    const setUrlsState = React.useCallback((nextUrls: EndpointURL[] | ((urls?: EndpointURL[]) => EndpointURL[])) => {
        setUrls((previousUrls) => {
            const resolvedUrls = typeof nextUrls === "function" ? nextUrls(previousUrls) : nextUrls;
            window.localStorage.setItem("endpoints.urls", JSON.stringify(resolvedUrls));

            if (!resolvedUrls.some(({ value }) => value === authUrl)) {
                const nextAuthUrl = resolvedUrls[0]?.value || MAIN_SERVER_URL;
                setAuthUrlState(nextAuthUrl);
                window.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(nextAuthUrl));
            }

            return resolvedUrls;
        });
    }, [authUrl]);

    return (
        <EndpointContext.Provider
            value={{
                urls,
                enabled: urls.filter(({ enabled }) => enabled).map(({ value }) => value),
                isSyndicationLoading: false,
                setUrls: setUrlsState,
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
