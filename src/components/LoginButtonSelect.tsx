import * as React from "react";

import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";

import { buildAccountMenuItems, hasAnyLoggedInServer, parseAccountMenuValue } from "./authButton/utils";
import { useEndpointAuthAction } from "./EndpointAuthAction/useEndpointAuthAction";

type LoginButtonSelectProps = {
    returnTo: string;
    className?: string;
};

export const LoginButtonSelect: React.FunctionComponent<LoginButtonSelectProps> = (props) => {
    const { urls, runWithTargetAuthUrl } = useEndpointAuthAction();
    const hasLoggedInServer = hasAnyLoggedInServer(urls);
    const className = props.className ? `LoginButton ${props.className}` : "LoginButton";
    const label = hasLoggedInServer ? "Accounts" : "Log in";
    const icon = hasLoggedInServer ? <UserOutlined /> : <LoginOutlined />;

    const menu: MenuProps = {
        items: buildAccountMenuItems(urls),
        onClick: async ({ key }) => {
            const parsed = parseAccountMenuValue(key);

            if (!parsed) {
                return;
            }

            if (parsed.action === "login") {
                await runWithTargetAuthUrl(parsed.targetAuthUrl, async (currentAuth) => {
                    await currentAuth.signinRedirect({
                        state: props.returnTo,
                    });
                });
                return;
            }

            await runWithTargetAuthUrl(parsed.targetAuthUrl, async (currentAuth) => {
                await currentAuth.removeUser();
            });
        },
    };

    return (
        <Dropdown
            menu={menu}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="LoginButton__menu"
        >
            <Button
                className={className}
                size="large"
                icon={icon}
            >
                <span className="LoginButton__label">{label}</span>
            </Button>
        </Dropdown>
    );
};
