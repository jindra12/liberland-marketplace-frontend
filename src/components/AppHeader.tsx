import React from "react";
import { Layout, Menu, Drawer, Button, Grid, Space, Flex } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { GlobalOutlined, MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { SearchButton } from "./SearchButton";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { LoginButton } from "./LoginButton";
import { CartHeaderButton } from "./cart/CartHeaderButton";
import { DesktopDrawer } from "./DesktopDrawer";
import { useCartItems } from "./cart/useCartItems";
import { RouteButton } from "./RouteButton";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const desktopBaseItems = [
    { key: "/jobs", label: "Jobs" },
    { key: "/products-services", label: "Market" },
    { key: "/companies", label: "Companies" },
    { key: "/ventures", label: "Ventures" },
    { key: "/tribes", label: "Tribes" },
];

const getSelectedKeys = (pathname: string, items: { key: string; label: string }[]) => {
    const found = items.find(({ key }) => pathname.startsWith(key))?.key;
    return found ? [found] : [];
};

export const AppHeader: React.FunctionComponent = () => {
    const { xl } = useBreakpoint();
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const { totalQuantity } = useCartItems();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const desktopItems = React.useMemo(() => {
        if (totalQuantity > 0) {
            return [...desktopBaseItems, { key: "/cart", label: "Cart" }];
        }
        return desktopBaseItems;
    }, [totalQuantity]);

    const drawerItems = React.useMemo(() => {
        if (totalQuantity > 0) {
            return [...desktopBaseItems, { key: "/cart", label: "Cart" }];
        }
        return desktopBaseItems;
    }, [totalQuantity]);

    const selectedDesktopKeys = getSelectedKeys(location.pathname, desktopItems);
    const selectedDrawerKeys = getSelectedKeys(location.pathname, drawerItems);
    const desktopMenuItems: MenuProps["items"] = React.useMemo(() => (
        desktopItems.map((item) => ({
            key: item.key,
            label: (
                <Link to={item.key} className="AppHeader__menuLink">
                    {item.label}
                </Link>
            ),
        }))
    ), [desktopItems]);
    const drawerMenuItems: MenuProps["items"] = React.useMemo(() => (
        drawerItems.map((item) => ({
            key: item.key,
            label: (
                <Link
                    to={item.key}
                    className="AppHeader__drawerMenuLink"
                    onClick={() => setDrawerOpen(false)}
                >
                    {item.label}
                </Link>
            ),
        }))
    ), [drawerItems]);

    return (
        <Header className="AppHeader">
            <div className="AppHeader__inner">
                <Link className="AppHeader__brand" to="/">
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
                            <DesktopDrawer />
                            <EndpointAuthAction>
                                {({ runWithAuthOrLogin }) => (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        className="AppHeader__publishBtn"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            runWithAuthOrLogin(() => navigate("/publish"));
                                        }}
                                    >
                                        Publish your ad
                                    </Button>
                                )}
                            </EndpointAuthAction>
                        </Flex>
                    </>
                ) : (
                    <Space className="AppHeader__mobile" align="center" size={8}>
                        <SearchButton className="AppHeader__iconButton" />
                        <RouteButton
                            to="/syndication"
                            className="AppHeader__iconButton"
                            type="text"
                            icon={<GlobalOutlined />}
                            aria-label="Open syndication"
                        />
                        {totalQuantity > 0 && <CartHeaderButton className="AppHeader__iconButton" />}
                        <Button
                            className="AppHeader__burger AppHeader__iconButton"
                            type="text"
                            icon={<MenuOutlined />}
                            aria-label="Open navigation"
                            onClick={() => setDrawerOpen(true)}
                        />
                        <Drawer
                            className="AppHeader__drawer"
                            placement="left"
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                            title={
                                <div className="AppHeader__drawerTitle">
                                    <img className="AppHeader__logo" src="/logo.svg" alt="NSwap" />
                                    <span className="AppHeader__name">NSwap</span>
                                </div>
                            }
                        >
                            <div className="AppHeader__drawerBody">
                                <Menu
                                    className="AppHeader__drawerMenu"
                                    mode="inline"
                                    items={drawerMenuItems}
                                    selectedKeys={selectedDrawerKeys}
                                />
                                <div className="AppHeader__drawerNav">
                                    <EndpointAuthAction>
                                        {({ runWithAuthOrLogin }) => (
                                            <Button
                                                block
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    runWithAuthOrLogin(
                                                        () => { navigate("/publish"); setDrawerOpen(false); },
                                                        { onUnauthorizedBeforeLogin: () => setDrawerOpen(false) },
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
                                            onClick={() => { navigate("/profile"); setDrawerOpen(false); }}
                                        >
                                            Profile
                                        </Button>
                                    ) : (
                                        <LoginButton block onAfterClick={() => setDrawerOpen(false)} />
                                    )}
                                </div>
                            </div>
                        </Drawer>
                    </Space>
                )}
            </div>
        </Header>
    );
};
