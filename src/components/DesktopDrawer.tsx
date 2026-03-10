import * as React from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { SearchButton } from "./SearchButton";
import { EndpointDrawerButton } from "./EndpointDrawerButton";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { LoginButton } from "./LoginButton";

export const DesktopDrawer: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const [desktopActionsOpen, setDesktopActionsOpen] = React.useState(false);

    return (
        <>
            <Button
                className="AppHeader__quickActionsBtn"
                type="primary"
                icon={<MenuOutlined />}
                aria-label="Open quick actions"
                onClick={() => setDesktopActionsOpen(true)}
            >
                Quick actions
            </Button>
            <Drawer
                className="AppHeader__desktopDrawer"
                placement="right"
                width={360}
                open={desktopActionsOpen}
                onClose={() => setDesktopActionsOpen(false)}
                title="Quick actions"
            >
                <div className="AppHeader__desktopDrawerNav">
                    <SearchButton type="default" block>Search</SearchButton>
                    <EndpointDrawerButton type="default" block>Endpoints</EndpointDrawerButton>
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
                                Publish your ad
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
                    ) : (
                        <LoginButton block onAfterClick={() => setDesktopActionsOpen(false)} />
                    )}
                </div>
            </Drawer>
        </>
    );
};
