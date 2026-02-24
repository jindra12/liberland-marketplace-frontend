import * as React from "react";
import { BACKEND_URL } from "../gqlFetcher";

export type URL = { enabled: boolean, value: string };

export interface EndpointContextType {
    urls: URL[];
    enabled: string[];
    setUrls: (urls: URL[] | ((urls: URL[]) => URL[])) => void;
    authUrl: string;
    setAuthUrl: (auth: string) => void;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [urls, setUrls] = React.useState<URL[]>([{ enabled: true, value: BACKEND_URL }]);
    const [authUrl, setAuthUrl] = React.useState<string>(urls[0].value);
    const enabled = React.useMemo(() => urls.filter(({ enabled }) => enabled).map(({ value }) => value), [urls]);
    return (
        <EndpointContext.Provider value={{ setUrls, urls, enabled, authUrl, setAuthUrl }}>
            {props.children}
        </EndpointContext.Provider>
    );
};

export const useEndpointContext = () => React.useContext(EndpointContext);
