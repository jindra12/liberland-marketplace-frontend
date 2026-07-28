import type { MenuProps } from "antd";

import { getAccessToken } from "../../gqlFetcher";
import type { URL as EndpointURL } from "../../types";

export type AccountMenuAction = "login" | "logout";

export type AccountMenuValue = `${AccountMenuAction}:${string}`;

const encodeAccountMenuValue = (action: AccountMenuAction, targetAuthUrl: string): AccountMenuValue => {
    return `${action}:${encodeURIComponent(targetAuthUrl)}`;
};

export const parseAccountMenuValue = (
    value: string,
): {
    action: AccountMenuAction;
    targetAuthUrl: string;
} | undefined => {
    const separatorIndex = value.indexOf(":");

    if (separatorIndex < 0) {
        return undefined;
    }

    const action = value.slice(0, separatorIndex);

    if (action !== "login" && action !== "logout") {
        return undefined;
    }

    const encodedTargetAuthUrl = value.slice(separatorIndex + 1);

    if (!encodedTargetAuthUrl) {
        return undefined;
    }

    return {
        action,
        targetAuthUrl: decodeURIComponent(encodedTargetAuthUrl),
    };
};

const buildAccountMenuLeaf = (action: AccountMenuAction, endpoint: EndpointURL): NonNullable<MenuProps["items"]>[number] => {
    return {
        key: encodeAccountMenuValue(action, endpoint.value),
        label: endpoint.name || endpoint.value,
    };
};

const buildAccountMenuGroup = (
    action: AccountMenuAction,
    title: string,
    endpoints: EndpointURL[],
): NonNullable<MenuProps["items"]>[number] | undefined => {
    if (endpoints.length === 0) {
        return undefined;
    }

    return {
        key: action,
        type: "group",
        label: title,
        children: endpoints.map((endpoint) => buildAccountMenuLeaf(action, endpoint)),
    };
};

export const buildAccountMenuItems = (urls: EndpointURL[]): MenuProps["items"] => {
    const loginEndpoints = urls.filter((endpoint) => !getAccessToken(endpoint.value));
    const logoutEndpoints = urls.filter((endpoint) => Boolean(getAccessToken(endpoint.value)));

    return [buildAccountMenuGroup("login", "Log in", loginEndpoints), buildAccountMenuGroup("logout", "Log out", logoutEndpoints)].filter(
        (group): group is NonNullable<MenuProps["items"]>[number] => group !== undefined,
    );
};

export const hasAnyLoggedInServer = (urls: EndpointURL[]): boolean => {
    return urls.some((endpoint) => Boolean(getAccessToken(endpoint.value)));
};
