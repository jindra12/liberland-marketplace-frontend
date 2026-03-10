import React from "react";
import { Layout, Menu, Drawer, Button, Grid, Space, Flex } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { SearchButton } from "./SearchButton";
import { EndpointDrawerButton } from "./EndpointDrawerButton";
import { EndpointAuthAction } from "./EndpointAuthAction";
import { LoginButton } from "./LoginButton";
import { CartHeaderButton } from "./cart/CartHeaderButton";
import { DesktopDrawer } from "./DesktopDrawer";
import { useCartItems } from "./cart/useCartItems";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const baseItems = [
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
    const { md } = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const { totalQuantity } = useCartItems();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const items = React.useMemo(() => {
        if (totalQuantity > 0) {
            return [...baseItems, { key: "/cart", label: "Cart" }];
        }
        return baseItems;
    }, [totalQuantity]);

    const selectedKeys = getSelectedKeys(location.pathname, items);

    const onMenuClick: MenuProps["onClick"] = (info) => {
        navigate(info.key);
        setDrawerOpen(false);
    };

    return (
        <Header className="AppHeader">
            <div className="AppHeader__inner">
                <Link className="AppHeader__brand" to="/">
                    <img className="AppHeader__logo" src="/logo.svg" alt="NSwap" />
                    <span className="AppHeader__name">NSwap</span>
                </Link>

                {md ? (
                    <>
                        <Flex align="center" gap={16} className="AppHeader__desktopNav">
                            <Menu
                                className="AppHeader__menu"
                                mode="horizontal"
                                items={items}
                                selectedKeys={selectedKeys}
                                onClick={onMenuClick}
                            />
                            <DesktopDrawer />
                        </Flex>
                    </>
                ) : (
                    <Space className="AppHeader__mobile" align="center">
                        <SearchButton />
                        <EndpointDrawerButton />
                        <CartHeaderButton />
                        <Button
                            className="AppHeader__burger"
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
                            <Menu
                                mode="inline"
                                items={items}
                                selectedKeys={selectedKeys}
                                onClick={onMenuClick}
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
                        </Drawer>
                    </Space>
                )}
            </div>
        </Header>
    );
};
