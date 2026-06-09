import type { MenuProps } from "antd";

import type { URL as EndpointURL } from "../../types";

import { getSyndicationName } from "../endpoints/utils";

export const toEndpointShort = (value: string) => {
    try {
        const parsed = new URL(value);
        return parsed.hostname.replace(/^www\./i, "");
    } catch {
        return value
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .replace(/\/.*$/, "");
    }
};

export const getEndpointDisplayName = (endpoint: EndpointURL) => {
    return endpoint.name ? getSyndicationName(endpoint) : toEndpointShort(endpoint.value);
};

export const buildEndpointAuthMenuItems = (urls: EndpointURL[]): MenuProps["items"] => {
    return urls.map((endpoint) => ({
        key: endpoint.value,
        label: `${endpoint.name ? endpoint.name : toEndpointShort(endpoint.value)} server`,
    }));
};
