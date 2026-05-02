import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";

import { GlobalOutlined, MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";

import { routes } from "../routes";

import { DisclaimersButton } from "./disclaimers/DisclaimersButton";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { useEndpointContext } from "./EndpointContext";
import { RouteButton } from "./RouteButton";
import { SearchButton } from "./SearchButton";
import { SortContentBySelect } from "./SortContentBySelect";

export const DesktopDrawer: React.FunctionComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const { urls } = useEndpointContext();
    const [desktopActionsOpen, setDesktopActionsOpen] = React.useState(false);

    React.useEffect(() => {
        setDesktopActionsOpen(false);
    }, [location.pathname]);

    return (
        <>
            <Button
                className="AppHeader__quickActionsBtn"
                type="default"
                icon={<MenuOutlined />}
                aria-label="Open menu"
                onClick={() => setDesktopActionsOpen(true)}
            >
                Menu
            </Button>
            <Drawer
                className="AppHeader__desktopDrawer"
                placement="right"
                width={360}
                open={desktopActionsOpen}
                onClose={() => setDesktopActionsOpen(false)}
                title="Menu"
            >
                <div className="AppHeader__desktopDrawerNav">
                    <SearchButton type="default" block onScopeSelect={() => setDesktopActionsOpen(false)}>
                        Search
                    </SearchButton>
                    <DisclaimersButton block onClick={() => setDesktopActionsOpen(false)} />
                    {urls.length > 1 ? (
                        <RouteButton to={routes.syndication.route} block type="default" icon={<GlobalOutlined />}>
                            Syndication
                        </RouteButton>
                    ) : null}
                    <EndpointAuthAction>
                        {({ runWithAuthOrLogin }) => (
                            <Button
                                block
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={(event) => {
                                    event.preventDefault();
                                    runWithAuthOrLogin(
                                        () => {
                                            navigate(routes.publish.route);
                                            setDesktopActionsOpen(false);
                                        },
                                        { onUnauthorizedBeforeLogin: () => setDesktopActionsOpen(false) },
                                    );
                                }}
                                className="AppHeader__drawerPublish"
                            >
                                Publish ad
                            </Button>
                        )}
                    </EndpointAuthAction>
                    {auth.isAuthenticated ? (
                        <Button
                            block
                            icon={<UserOutlined />}
                            onClick={() => {
                                navigate(routes.profile.route);
                                setDesktopActionsOpen(false);
                            }}
                        >
                            Profile
                        </Button>
                    ) : null}
                    <SortContentBySelect />
                </div>
            </Drawer>
        </>
    );
};
