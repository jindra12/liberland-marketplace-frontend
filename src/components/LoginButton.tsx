import * as React from "react";

import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { EndpointAuthAction } from "./EndpointAuthAction";
import type { EndpointAuthClient } from "./EndpointContext";

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
                        runWithEndpointSelection(async (currentAuth: EndpointAuthClient) => {
                            props.onAfterClick?.();
                            if (action === "login") {
                                await currentAuth.signinRedirect();
                                return;
                            }
                            await currentAuth.removeUser();
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
