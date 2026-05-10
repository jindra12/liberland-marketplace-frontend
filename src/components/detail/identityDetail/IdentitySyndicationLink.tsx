import * as React from "react";

import { LinkOutlined } from "@ant-design/icons";

import { routes } from "../../../routes";
import { useEndpointContext } from "../../EndpointContext";
import { RouteButton } from "../../RouteButton";

type IdentitySyndicationLinkProps = {
    serverURL?: string | null;
};

export const IdentitySyndicationLink: React.FunctionComponent<IdentitySyndicationLinkProps> = (props) => {
    const { enabled, urls } = useEndpointContext();
    const syndicationUrl = urls.find((url) => url.enabled && url.value === props.serverURL);

    if (enabled.length <= 1 || !syndicationUrl) {
        return null;
    }

    return (
        <RouteButton
            to={routes.syndication.detail.getLink(syndicationUrl)}
            type="default"
            size="large"
            icon={<LinkOutlined />}
            className="IdentityDetail__syndicationLink"
        >
            Open syndication source
        </RouteButton>
    );
};
