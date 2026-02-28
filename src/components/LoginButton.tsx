import * as React from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import { useEndpointContext } from "./EndpointContext";

type EndpointAction = () => void | Promise<void>;

type EndpointAuthActionRenderProps = {
    runWithEndpointSelection: (action: EndpointAction) => void;
    runWithAuthOrLogin: (
        authorizedAction: EndpointAction,
        options?: { onUnauthorizedBeforeLogin?: () => void | Promise<void> },
    ) => void;
};

type EndpointAuthActionProps = {
    children: (props: EndpointAuthActionRenderProps) => React.ReactElement;
};

export const EndpointAuthAction: React.FunctionComponent<EndpointAuthActionProps> = ({ children }) => {
    const auth = useAuth();
    const { urls, authUrl, setAuthUrl } = useEndpointContext();
    const [pendingActionUrl, setPendingActionUrl] = React.useState<string>();
    const [open, setOpen] = React.useState(false);
    const pendingActionRef = React.useRef<EndpointAction | undefined>(undefined);
    const triggerRef = React.useRef<HTMLSpanElement | null>(null);
    const overlayClassName = React.useRef(`EndpointAuthAction__menu-${Math.random().toString(36).slice(2)}`).current;

    const runPendingAction = React.useCallback(async () => {
        const action = pendingActionRef.current;
        pendingActionRef.current = undefined;
        if (!action) return;
        await action();
    }, []);

    const runWithEndpointSelection = React.useCallback((action: EndpointAction) => {
        pendingActionRef.current = action;
        setOpen(true);
    }, []);

    const runWithAuthOrLogin = React.useCallback(
        (
            authorizedAction: EndpointAction,
            options?: { onUnauthorizedBeforeLogin?: () => void | Promise<void> },
        ) => {
            if (auth.isAuthenticated) {
                void authorizedAction();
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
        if (!pendingActionUrl) return;
        if (authUrl !== pendingActionUrl) return;

        setPendingActionUrl(undefined);
        void runPendingAction();
    }, [pendingActionUrl, authUrl, runPendingAction]);

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

    const items: MenuProps["items"] = urls.map((endpoint) => ({
        key: endpoint.value,
        label: endpoint.name?.trim()
            ? `${endpoint.name} (${toEndpointShort(endpoint.value)})`
            : toEndpointShort(endpoint.value),
    }));

    const onMenuClick: MenuProps["onClick"] = (info) => {
        const url = String(info.key);
        setOpen(false);

        if (url !== authUrl) {
            setPendingActionUrl(url);
            setAuthUrl(url);
            return;
        }

        void runPendingAction();
    };

    React.useEffect(() => {
        if (!open) return;

        const onDocumentMouseDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) {
                return;
            }

            const popup = document.querySelector(`.${overlayClassName}`);
            if (popup?.contains(target)) {
                return;
            }

            setOpen(false);
        };

        document.addEventListener("mousedown", onDocumentMouseDown, true);
        return () => {
            document.removeEventListener("mousedown", onDocumentMouseDown, true);
        };
    }, [open, overlayClassName]);

    return (
        <Dropdown
            trigger={[]}
            menu={{ items, onClick: onMenuClick }}
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            overlayClassName={overlayClassName}
        >
            <span ref={triggerRef}>
                {children({ runWithEndpointSelection, runWithAuthOrLogin })}
            </span>
        </Dropdown>
    );
};

type LoginButtonProps = {
    action?: "login" | "logout";
    type?: React.ComponentProps<typeof Button>["type"];
    block?: boolean;
    danger?: boolean;
    onAfterClick?: () => void;
    onAfterAction?: () => void | Promise<void>;
};

export const LoginButton: React.FunctionComponent<LoginButtonProps> = ({
    action = "login",
    type,
    block,
    danger,
    onAfterClick,
    onAfterAction,
}) => {
    const auth = useAuth();

    return (
        <EndpointAuthAction>
            {({ runWithEndpointSelection }) => (
                <Button
                    type={type}
                    icon={action === "login" ? <LoginOutlined /> : <LogoutOutlined />}
                    block={block}
                    danger={danger}
                    onClick={(event) => {
                        event.preventDefault();
                        runWithEndpointSelection(async () => {
                            onAfterClick?.();
                            if (action === "login") {
                                await auth.signinRedirect();
                                return;
                            }
                            await auth.removeUser();
                            await onAfterAction?.();
                        });
                    }}
                >
                    {action === "login" ? "Log in" : "Log out"}
                </Button>
            )}
        </EndpointAuthAction>
    );
};
