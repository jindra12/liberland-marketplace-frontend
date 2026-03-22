import * as React from "react";
import { Button, Drawer } from "antd";
import { GlobalOutlined, MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { SearchButton } from "./SearchButton";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { RouteButton } from "./RouteButton";
import { useEndpointContext } from "./EndpointContext";

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
                    {urls.length > 1 ? (
                        <RouteButton
                            to="/syndication"
                            block
                            type="default"
                            icon={<GlobalOutlined />}
                        >
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
                                        () => { navigate("/publish"); setDesktopActionsOpen(false); },
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
                            onClick={() => { navigate("/profile"); setDesktopActionsOpen(false); }}
                        >
                            Profile
                        </Button>
                    ) : null}
                </div>
            </Drawer>
        </>
    );
};
