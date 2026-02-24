import * as React from "react";

export type URL = { enabled: boolean, value: string };

export interface EndpointContextType {
    urls: URL[];
    enabled: string[];
    setUrls: (urls: URL[] | ((urls: URL[]) => URL[])) => void;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [urls, setUrls] = React.useState<URL[]>([]);
    const enabled = React.useMemo(() => urls.filter(({ enabled }) => enabled).map(({ value }) => value), [urls]);
    return (
        <EndpointContext.Provider value={{ setUrls, urls, enabled }}>
            {props.children}
        </EndpointContext.Provider>
    );
};

export const useEndpointContext = () => React.useContext(EndpointContext);
