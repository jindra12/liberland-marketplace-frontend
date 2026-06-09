import type { Dispatch, ReactElement, SetStateAction } from "react";
import type { AuthContextProps } from "react-oidc-context";

import type { URL as EndpointURL } from "../../types";

export type EndpointAuthClient = Pick<AuthContextProps, "signinRedirect" | "removeUser">;

export type EndpointAction = (auth: EndpointAuthClient) => void | Promise<void>;

export type EndpointPendingAction = {
    action: EndpointAction;
    targetAuthUrl?: string;
};

export type EndpointAuthActionRenderProps = {
    runWithEndpointSelection: (action: EndpointAction) => void;
    runWithTargetAuthUrl: (targetAuthUrl: string, action: EndpointAction) => Promise<void>;
    runWithAuthOrLogin: (
        authorizedAction: EndpointAction,
        options?: {
            onUnauthorizedBeforeLogin?: () => void | Promise<void>;
        },
    ) => Promise<void>;
};

export type EndpointAuthActionProps = {
    defaultAuthUrl?: string;
    requireVerifiedEmail?: boolean;
    children: (props: EndpointAuthActionRenderProps) => ReactElement;
};

export type EndpointAuthActionController = {
    auth: AuthContextProps;
    urls: EndpointURL[];
    authUrl: string;
    pendingAction?: EndpointPendingAction;
    setAuthUrl: (auth: string) => void;
    setPendingAction: Dispatch<SetStateAction<EndpointPendingAction | undefined>>;
    runWithTargetAuthUrl: (targetAuthUrl: string, action: EndpointAction) => Promise<void>;
};
