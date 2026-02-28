import * as React from "react";
import { Button } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import { EndpointAuthAction } from "./EndpointAuthAction";

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
