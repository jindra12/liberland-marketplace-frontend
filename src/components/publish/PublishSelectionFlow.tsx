import * as React from "react";

import { useEndpointContext } from "../EndpointContext";

import { PublishContent } from "./PublishContent";
import { PublishServerSelector } from "./PublishServerSelector";
import { getPublishableUrls } from "./utils";

export const PublishSelectionFlow: React.FunctionComponent = () => {
    const { urls, setAuthUrl } = useEndpointContext();
    const publishableUrls = getPublishableUrls(urls);
    const [selectedServerUrl, setSelectedServerUrl] = React.useState<string | null>(() =>
        urls.length === 1
            ? urls[0].value
            : publishableUrls.length === 1
              ? publishableUrls[0].value
              : null,
    );

    if (selectedServerUrl) {
        return <PublishContent url={selectedServerUrl} />;
    }

    return (
        <PublishServerSelector
            onConfirm={(serverUrl) => {
                setAuthUrl(serverUrl);
                setSelectedServerUrl(serverUrl);
            }}
            urls={urls}
        />
    );
};
