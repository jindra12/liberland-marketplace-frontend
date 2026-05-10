import * as React from "react";

import { useEndpointContext } from "../EndpointContext";

import { PublishContent } from "./PublishContent";
import { PublishServerSelector } from "./PublishServerSelector";
import { getPublishableUrls } from "./utils";

export interface PublishSelectionFlowProps {
    canCreateContent: (serverUrl: string) => boolean;
}

export const PublishSelectionFlow: React.FunctionComponent<PublishSelectionFlowProps> = (props) => {
    const { urls, setAuthUrl } = useEndpointContext();
    const publishableUrls = getPublishableUrls(urls);
    const permittedPublishableUrls = publishableUrls.filter((url) => props.canCreateContent(url.value));
    const [selectedServerUrl, setSelectedServerUrl] = React.useState<string | null>(() =>
        urls.length === 1
            ? urls[0].value
            : permittedPublishableUrls.length === 1
              ? permittedPublishableUrls[0].value
              : null,
    );

    if (selectedServerUrl) {
        const canCreateContent = props.canCreateContent(selectedServerUrl);
        return (
            <PublishContent
                canCreateContent={canCreateContent}
                url={selectedServerUrl}
            />
        );
    }

    return (
        <PublishServerSelector
            onConfirm={(serverUrl) => {
                if (props.canCreateContent(serverUrl)) {
                    setAuthUrl(serverUrl);
                }
                setSelectedServerUrl(serverUrl);
            }}
            urls={urls}
        />
    );
};
