import * as React from "react";

import { useAuth } from "react-oidc-context";

import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { EndpointAuthAction } from "./EndpointAuthAction";

type LoginButtonProps = {
    action?: "login" | "logout";
    type?: React.ComponentProps<typeof Button>["type"];
    block?: boolean;
    danger?: boolean;
    className?: string;
    onAfterClick?: () => void;
    onAfterAction?: () => void | Promise<void>;
};
export const LoginButton: React.FunctionComponent<LoginButtonProps> = (props) => {
    const action = props.action === undefined ? "login" : props.action;
    const auth = useAuth();
    return (
        <EndpointAuthAction>
            {({ runWithEndpointSelection }) => (
                <Button
                    type={props.type}
                    icon={action === "login" ? <LoginOutlined /> : <LogoutOutlined />}
                    block={props.block}
                    danger={props.danger}
                    className={props.className}
                    onClick={(event) => {
                        event.preventDefault();
                        runWithEndpointSelection(async () => {
                            props.onAfterClick?.();
                            if (action === "login") {
                                await auth.signinRedirect();
                                return;
                            }
                            await auth.removeUser();
                            await props.onAfterAction?.();
                        });
                    }}
                >
                    {action === "login" ? "Log in" : "Log out"}
                </Button>
            )}
        </EndpointAuthAction>
    );
};
