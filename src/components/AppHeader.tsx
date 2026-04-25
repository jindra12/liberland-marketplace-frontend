import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Button, Grid, Space, Flex } from "antd";

import { routes } from "../routes";

import { CartHeaderButton } from "./cart/CartHeaderButton";
import { useCartItems } from "./cart/useCartItems";
import { DesktopDrawer } from "./DesktopDrawer";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { LoginButton } from "./LoginButton";
import { MobileDrawer } from "./MobileDrawer";
import { getSelectedKeys } from "./MobileDrawer/utils";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const desktopBaseItems = [
    { key: routes.jobs.route, label: "Jobs" },
    { key: routes.productsServices.route, label: "Market" },
    { key: routes.companies.route, label: "Companies" },
    { key: routes.ventures.route, label: "Ventures" },
    { key: routes.tribes.route, label: "Tribes" },
];

export const AppHeader: React.FunctionComponent = () => {
    const { xl } = useBreakpoint();
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const { totalQuantity } = useCartItems();
    const authAction = auth.isAuthenticated ? "logout" : "login";

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    React.useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    const desktopItems = React.useMemo(() => {
        if (totalQuantity > 0) {
            return [...desktopBaseItems, { key: routes.cart.route, label: "Cart" }];
        }
        return desktopBaseItems;
    }, [totalQuantity]);

    const selectedDesktopKeys = getSelectedKeys(location.pathname, desktopItems);
    const desktopMenuItems: MenuProps["items"] = React.useMemo(
        () =>
            desktopItems.map((item) => ({
                key: item.key,
                label: (
                    <Link to={item.key} className="AppHeader__menuLink">
                        {item.label}
                    </Link>
                ),
            })),
        [desktopItems],
    );

    return (
        <Header className="AppHeader">
            <div className="AppHeader__inner">
                <Link className="AppHeader__brand" to={routes.home.route}>
                    <img className="AppHeader__logo" src="/logo.svg" alt="NSwap" />
                    <span className="AppHeader__name">NSwap</span>
                </Link>

                {xl ? (
                    <>
                        <div className="AppHeader__menuSlot">
                            <Menu
                                className="AppHeader__menu"
                                mode="horizontal"
                                disabledOverflow
                                items={desktopMenuItems}
                                selectedKeys={selectedDesktopKeys}
                            />
                        </div>
                        <Flex align="center" gap={12} className="AppHeader__desktopActions">
                            <EndpointAuthAction>
                                {({ runWithAuthOrLogin }) => (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        className="AppHeader__publishBtn"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            runWithAuthOrLogin(() => navigate(routes.publish.route));
                                        }}
                                    >
                                        Publish ad
                                    </Button>
                                )}
                            </EndpointAuthAction>
                            <LoginButton
                                action={authAction}
                                type="default"
                                className="AppHeader__authBtn"
                                onAfterAction={() => navigate(routes.home.route)}
                            />
                            <DesktopDrawer />
                        </Flex>
                    </>
                ) : (
                    <Space className="AppHeader__mobile" align="center" size={8}>
                        <LoginButton
                            action={authAction}
                            type="text"
                            className="AppHeader__mobileAuthBtn"
                            onAfterAction={() => navigate(routes.home.route)}
                        />
                        {totalQuantity > 0 && <CartHeaderButton className="AppHeader__iconButton" />}
                        <Button
                            className="AppHeader__burger AppHeader__iconButton"
                            type="text"
                            icon={<MenuOutlined />}
                            aria-label="Open navigation"
                            onClick={() => setDrawerOpen(true)}
                        />
                        <MobileDrawer
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        />
                    </Space>
                )}
            </div>
        </Header>
    );
};
