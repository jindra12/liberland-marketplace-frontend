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
        if (props.defaultAuthUrl) {
            runWithTargetAuthUrl(props.defaultAuthUrl, action);
            return;
        }

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
        const runWithAccount = async (currentAuth: EndpointAuthClient) => {
            if (currentAuth.isAuthenticated) {
                if (props.requireVerifiedEmail && currentAuth.user?.profile?.email_verified !== true) {
                    setPendingAction(undefined);
                    showUnverifiedEmailNotification(props.defaultAuthUrl ?? authUrl);
                    return;
                }

                setPendingAction(undefined);
                await authorizedAction(currentAuth);
                return;
            }

            await options?.onUnauthorizedBeforeLogin?.();
            await currentAuth.signinRedirect({ state: options?.signinState });
        };

        if (props.defaultAuthUrl) {
            await runWithTargetAuthUrl(props.defaultAuthUrl, runWithAccount);
            return;
        }

        if (auth.isAuthenticated) {
            await runWithAccount(auth);
            return;
        }

        runWithEndpointSelection(runWithAccount);
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

    if (props.defaultAuthUrl) {
        return props.children({
            runWithEndpointSelection,
            runWithTargetAuthUrl,
            runWithAuthOrLogin,
        });
    }

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
