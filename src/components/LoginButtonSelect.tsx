import * as React from "react";

import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";

import { getAccessToken } from "../gqlFetcher";

import { buildAccountMenuItems, hasAnyLoggedInServer, parseAccountMenuValue } from "./authButton/utils";
import { useEndpointAuthAction } from "./EndpointAuthAction/useEndpointAuthAction";

type LoginButtonSelectProps = {
    returnTo: string;
    className?: string;
};

export const LoginButtonSelect: React.FunctionComponent<LoginButtonSelectProps> = (props) => {
    const { urls, runWithTargetAuthUrl } = useEndpointAuthAction();
    const hasLoggedInServer = hasAnyLoggedInServer(urls);
    const loginEndpoints = urls.filter((endpoint) => !getAccessToken(endpoint.value));
    const logoutEndpoints = urls.filter((endpoint) => Boolean(getAccessToken(endpoint.value)));
    const hasSingleLoginEndpoint = loginEndpoints.length === 1 && logoutEndpoints.length === 0;
    const hasSingleLogoutEndpoint = logoutEndpoints.length === 1 && loginEndpoints.length === 0;
    const className = props.className ? `LoginButton ${props.className}` : "LoginButton";
    const label = hasSingleLogoutEndpoint ? "Log out" : hasLoggedInServer ? "Accounts" : "Log in";
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

    if (hasSingleLoginEndpoint || hasSingleLogoutEndpoint) {
        const [onlyEndpoint] = hasSingleLoginEndpoint ? loginEndpoints : logoutEndpoints;

        return (
            <Button
                className={className}
                size="large"
                icon={icon}
                onClick={async () => {
                    if (hasSingleLoginEndpoint) {
                        await runWithTargetAuthUrl(onlyEndpoint.value, async (currentAuth) => {
                            await currentAuth.signinRedirect({
                                state: props.returnTo,
                            });
                        });
                        return;
                    }

                    await runWithTargetAuthUrl(onlyEndpoint.value, async (currentAuth) => {
                        await currentAuth.removeUser();
                    });
                }}
            >
                <span className="LoginButton__label">{label}</span>
            </Button>
        );
    }

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
