import * as React from "react";

import { useAuth } from "react-oidc-context";

import { Button, Dropdown, notification, Space } from "antd";
import type { MenuProps } from "antd";

import { useEndpointContext, type EndpointAuthClient, type EndpointPendingAction } from "./EndpointContext";
import { getSyndicationName } from "./endpoints/utils";

type EndpointAction = (auth: EndpointAuthClient) => void | Promise<void>;
export type EndpointAuthActionRenderProps = {
    runWithEndpointSelection: (action: EndpointAction) => void;
    runWithAuthOrLogin: (
        authorizedAction: EndpointAction,
        options?: {
            onUnauthorizedBeforeLogin?: () => void | Promise<void>;
        },
    ) => Promise<void>;
};
type EndpointAuthActionProps = {
    defaultAuthUrl?: string;
    requireVerifiedEmail?: boolean;
    children: (props: EndpointAuthActionRenderProps) => React.ReactElement;
};
const toEndpointShort = (value: string) => {
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
export const EndpointAuthAction: React.FunctionComponent<EndpointAuthActionProps> = (props) => {
    const auth = useAuth();
    const { urls, authUrl, setAuthUrl, pendingAction, setPendingAction } = useEndpointContext();
    const [open, setOpen] = React.useState(false);
    const showUnverifiedEmailNotification = (targetAuthUrl: string) => {
        const targetEndpoint = urls.find((entry) => entry.value === targetAuthUrl);
        const targetEndpointName = targetEndpoint ? getSyndicationName(targetEndpoint) : toEndpointShort(targetAuthUrl);

        notification.warning({
            key: `endpoint-auth-unverified-${targetAuthUrl}`,
            duration: 0,
            message: "Please verify your email first",
            description: `Your email address still needs to be verified on ${targetEndpointName} before you can continue.`,
            btn: (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                            window.open(targetAuthUrl, "_blank", "noopener,noreferrer");
                        }}
                    >
                        Open {targetEndpointName}
                    </Button>
                </Space>
            ),
        });
    };
    const runPendingAction = React.useCallback(async (nextAction?: EndpointPendingAction) => {
        if (!nextAction) {
            return;
        }
        setPendingAction(undefined);
        await nextAction.action(auth);
    }, [auth, setPendingAction]);
    const runWithEndpointSelection = React.useCallback(
        async (action: EndpointAction) => {
            if (urls.length === 1) {
                const [onlyEndpoint] = urls;
                if (onlyEndpoint.value !== authUrl) {
                    setPendingAction({
                        action,
                        targetAuthUrl: onlyEndpoint.value,
                    });
                    setAuthUrl(onlyEndpoint.value);
                    return;
                }
                await runPendingAction({
                    action,
                    targetAuthUrl: onlyEndpoint.value,
                });
                return;
            }
            setPendingAction({
                action,
            });
            setOpen(true);
        },
        [authUrl, runPendingAction, setAuthUrl, setPendingAction, urls],
    );
    const runWithAuthOrLogin = async (
        authorizedAction: EndpointAction,
        options?: {
            onUnauthorizedBeforeLogin?: () => void | Promise<void>;
        },
    ) => {
        if (auth.isAuthenticated) {
            if (props.requireVerifiedEmail && auth.user?.profile?.email_verified !== true) {
                const runUnverifiedAction = async () => {
                    setPendingAction(undefined);
                    showUnverifiedEmailNotification(props.defaultAuthUrl ?? authUrl);
                };
                if (props.defaultAuthUrl) {
                    if (authUrl === props.defaultAuthUrl) {
                        await runUnverifiedAction();
                        return;
                    }
                    setPendingAction({
                        action: runUnverifiedAction,
                        targetAuthUrl: props.defaultAuthUrl,
                    });
                    setAuthUrl(props.defaultAuthUrl);
                    return;
                }
                await runUnverifiedAction();
                return;
            }
            setPendingAction(undefined);
            await authorizedAction(auth);
            return;
        }
        if (props.defaultAuthUrl) {
            const runLogin = async (currentAuth: EndpointAuthClient) => {
                await options?.onUnauthorizedBeforeLogin?.();
                await currentAuth.signinRedirect();
            };
            if (authUrl === props.defaultAuthUrl) {
                await runLogin(auth);
                return;
            }
            setPendingAction({
                action: runLogin,
                targetAuthUrl: props.defaultAuthUrl,
            });
            setAuthUrl(props.defaultAuthUrl);
            return;
        }
        runWithEndpointSelection(async (currentAuth) => {
            await options?.onUnauthorizedBeforeLogin?.();
            await currentAuth.signinRedirect();
        });
    };
    React.useEffect(() => {
        if (!pendingAction?.targetAuthUrl || authUrl !== pendingAction.targetAuthUrl) {
            return;
        }
        runPendingAction(pendingAction);
    }, [authUrl, pendingAction, runPendingAction]);
    const items: MenuProps["items"] = urls.map((endpoint) => ({
        key: endpoint.value,
        label: `Server ${endpoint.name ? endpoint.name : toEndpointShort(endpoint.value)}`,
    }));
    const onMenuClick: MenuProps["onClick"] = (info) => {
        const url = String(info.key);
        setOpen(false);
        if (!pendingAction) {
            return;
        }
        if (url !== authUrl) {
            setPendingAction((current) =>
                current
                    ? {
                          ...current,
                          targetAuthUrl: url,
                      }
                    : current,
            );
            setAuthUrl(url);
            return;
        }
        runPendingAction(pendingAction);
    };
    return (
        <Dropdown
            trigger={["click"]}
            menu={{
                items,
                onClick: onMenuClick,
            }}
            placement="bottomRight"
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setOpen(false);
                    return;
                }
                if (pendingAction) {
                    setOpen(true);
                }
            }}
        >
            {props.children({
                runWithEndpointSelection,
                runWithAuthOrLogin,
            })}
        </Dropdown>
    );
};
