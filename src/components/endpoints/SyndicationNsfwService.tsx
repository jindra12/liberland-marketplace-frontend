import * as React from "react";

import { useEndpointContext } from "../EndpointContext";

import { SyndicationNsfwModal } from "./SyndicationNsfwModal";
import { useNsfwConsent } from "./useNsfwConsent";
import { disableNsfwEndpoints, hasEnabledNsfwEndpoints } from "./utils";

export const SyndicationNsfwService: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { urls, setUrls } = useEndpointContext();
    const [hasAcceptedNsfw, setHasAcceptedNsfw] = useNsfwConsent();
    const hasEnabledNsfw = hasEnabledNsfwEndpoints(urls);
    const enabledCount = urls.filter((entry) => entry.enabled && Boolean(entry.nsfw)).length;

    return (
        <>
            {props.children}
            <SyndicationNsfwModal
                open={hasEnabledNsfw && !hasAcceptedNsfw}
                enabledCount={enabledCount}
                onContinue={() => {
                    setHasAcceptedNsfw(true);
                }}
                onDisableAll={() => {
                    setUrls((current) => disableNsfwEndpoints(current));
                }}
            />
        </>
    );
};
