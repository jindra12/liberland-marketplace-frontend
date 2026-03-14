import React from "react";
import { useEndpointContext } from "./EndpointContext";
import { PublishContent } from "./publish/PublishContent";
import { PublishServerSelector } from "./publish/PublishServerSelector";

const Publish: React.FunctionComponent = () => {
    const { urls, setAuthUrl } = useEndpointContext();
    const [serverSelected, setServerSelected] = React.useState(false);

    const handleServerConfirm = (url: string) => {
        setAuthUrl(url);
        setServerSelected(true);
    };

    if (!serverSelected) {
        return (
            <PublishServerSelector
                urls={urls}
                onConfirm={handleServerConfirm}
            />
        );
    }

    return <PublishContent />;
};

export default Publish;
