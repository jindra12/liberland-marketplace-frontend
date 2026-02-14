// src/layout/AppHeader.tsx
import React from "react";
import { Layout, Menu, Drawer, Button, Grid, Space, Flex } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { SearchButton } from "./SearchButton";
import { useAuth } from "react-oidc-context";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const items = [
    { key: "/jobs", label: "Jobs" },
    { key: "/products", label: "Market" },
    { key: "/companies", label: "Companies" },
    { key: "/identities", label: "Identities" },
];

const getSelectedKeys = (pathname: string) => {
    const found = items.find(({ key }) => pathname.startsWith(key))?.key;
    return found ? [found] : [];
};

export const AppHeader: React.FunctionComponent = () => {
    const { md } = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const selectedKeys = getSelectedKeys(location.pathname);

    const onMenuClick: MenuProps["onClick"] = (info) => {
        navigate(info.key);
        setDrawerOpen(false);
    };

    return (
        <Header className="AppHeader">
            <div className="AppHeader__inner">
                <Link className="AppHeader__brand" to="/">
                    <img className="AppHeader__logo" src="/logo.svg" alt="Jita-44" />
                    <span className="AppHeader__name">Jita-44</span>
                </Link>

                {md ? (
                    <Flex align="center" gap={16}>
                        <SearchButton />
                        <Menu
                            className="AppHeader__menu"
                            mode="horizontal"
                            items={items}
                            selectedKeys={selectedKeys}
                            onClick={onMenuClick}
                        />
                        {auth.isAuthenticated ? (
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={() => auth.removeUser()}
                            >
                                Log out
                            </Button>
                        ) : (
                            <Button
                                type="text"
                                icon={<LoginOutlined />}
                                onClick={() => auth.signinRedirect()}
                            >
                                Log in
                            </Button>
                        )}
                    </Flex>
                ) : (
                    <Space className="AppHeader__mobile" align="center">
                        <SearchButton />
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
                                    <img className="AppHeader__logo" src="/logo.svg" alt="Jita-44" />
                                    <span className="AppHeader__name">Jita-44</span>
                                </div>
                            }
                        >
                            <Menu
                                mode="inline"
                                items={items}
                                selectedKeys={selectedKeys}
                                onClick={onMenuClick}
                            />
                            <div style={{ padding: "16px 24px" }}>
                                {auth.isAuthenticated ? (
                                    <Button
                                        block
                                        icon={<LogoutOutlined />}
                                        onClick={() => { auth.removeUser(); setDrawerOpen(false); }}
                                    >
                                        Log out
                                    </Button>
                                ) : (
                                    <Button
                                        block
                                        type="primary"
                                        icon={<LoginOutlined />}
                                        onClick={() => { auth.signinRedirect(); setDrawerOpen(false); }}
                                    >
                                        Log in
                                    </Button>
                                )}
                            </div>
                        </Drawer>
                    </Space>
                )}
            </div>
        </Header>
    );
};
