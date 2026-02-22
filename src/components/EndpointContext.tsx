import * as React from "react";

export interface EndpointContextType {
    urls: string[];
    setUrls: (urls: string[] | ((urls: string[]) => string[])) => void;
}

const EndpointContext = React.createContext<EndpointContextType>(null!);

export const EndpointContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [urls, setUrls] = React.useState<string[]>([]);
    return (
        <EndpointContext.Provider value={{ setUrls, urls }}>
            {props.children}
        </EndpointContext.Provider>
    );
};

export const useEndpointContext = () => React.useContext(EndpointContext);
