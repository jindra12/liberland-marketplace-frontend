import * as React from "react";

import { Button, Dropdown, notification, Space } from "antd";
import type { MenuProps } from "antd";

import type { EndpointAction, EndpointAuthActionProps, EndpointAuthClient } from "./types";
import { useEndpointAuthAction } from "./useEndpointAuthAction";
import { buildEndpointAuthMenuItems, getEndpointDisplayName, toEndpointShort } from "./utils";

export const EndpointAuthAction: React.FunctionComponent<EndpointAuthActionProps> = (props) => {
    const { auth, urls, authUrl, pendingAction, setPendingAction, runWithTargetAuthUrl } = useEndpointAuthAction();
    const [open, setOpen] = React.useState(false);

    const showUnverifiedEmailNotification = (targetAuthUrl: string) => {
        const targetEndpoint = urls.find((entry) => entry.value === targetAuthUrl);
        const targetEndpointName = targetEndpoint
            ? getEndpointDisplayName(targetEndpoint)
            : toEndpointShort(targetAuthUrl);

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

    const runWithEndpointSelection = (action: EndpointAction) => {
        if (urls.length === 1) {
            const [onlyEndpoint] = urls;
            runWithTargetAuthUrl(onlyEndpoint.value, action);
            return;
        }

        setPendingAction({
            action,
        });
        setOpen(true);
    };

    const runWithAuthOrLogin = async (
        authorizedAction: EndpointAction,
        options?: {
            onUnauthorizedBeforeLogin?: () => void | Promise<void>;
            signinState?: string;
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

                    await runWithTargetAuthUrl(props.defaultAuthUrl, runUnverifiedAction);
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
                await currentAuth.signinRedirect({
                    state: options?.signinState,
                });
            };

            if (authUrl === props.defaultAuthUrl) {
                await runLogin(auth);
                return;
            }

            await runWithTargetAuthUrl(props.defaultAuthUrl, runLogin);
            return;
        }

        runWithEndpointSelection(async (currentAuth) => {
            await options?.onUnauthorizedBeforeLogin?.();
            await currentAuth.signinRedirect({
                state: options?.signinState,
            });
        });
    };

    const items: MenuProps["items"] = buildEndpointAuthMenuItems(urls);

    const onMenuClick: MenuProps["onClick"] = (info) => {
        const url = String(info.key);
        setOpen(false);

        if (!pendingAction) {
            return;
        }

        runWithTargetAuthUrl(url, pendingAction.action);
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
                runWithTargetAuthUrl,
                runWithAuthOrLogin,
            })}
        </Dropdown>
    );
};
