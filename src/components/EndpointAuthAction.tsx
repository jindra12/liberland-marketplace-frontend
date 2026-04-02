import * as React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useAuth } from "react-oidc-context";
import { useEndpointContext } from "./EndpointContext";
type EndpointAction = () => void | Promise<void>;
type PendingAction = {
    action: EndpointAction;
    targetAuthUrl?: string;
};
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
    const { urls, authUrl, setAuthUrl } = useEndpointContext();
    const [pendingAction, setPendingAction] = React.useState<PendingAction>();
    const [open, setOpen] = React.useState(false);
    const runPendingAction = React.useCallback(async (nextAction?: PendingAction) => {
        if (!nextAction) {
            return;
        }
        setPendingAction(undefined);
        await nextAction.action();
    }, []);
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
        [authUrl, runPendingAction, setAuthUrl, urls],
    );
    const runWithAuthOrLogin = React.useCallback(
        async (
            authorizedAction: EndpointAction,
            options?: {
                onUnauthorizedBeforeLogin?: () => void | Promise<void>;
            },
        ) => {
            if (auth.isAuthenticated) {
                setPendingAction(undefined);
                await authorizedAction();
                return;
            }
            runWithEndpointSelection(async () => {
                await options?.onUnauthorizedBeforeLogin?.();
                await auth.signinRedirect();
            });
        },
        [auth, runWithEndpointSelection],
    );
    React.useEffect(() => {
        if (!pendingAction?.targetAuthUrl || authUrl !== pendingAction.targetAuthUrl) {
            return;
        }
        runPendingAction(pendingAction);
    }, [authUrl, pendingAction, runPendingAction]);
    const items: MenuProps["items"] = urls.map((endpoint) => ({
        key: endpoint.value,
        label: endpoint.name?.trim() ? `${endpoint.name} (${toEndpointShort(endpoint.value)})` : toEndpointShort(endpoint.value),
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
                    setPendingAction(undefined);
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
