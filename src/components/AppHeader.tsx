// src/layout/AppHeader.tsx
import React from "react";
import { Layout, Menu, Drawer, Button, Grid, Space, Flex } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { SearchButton } from "./SearchButton";
import { useAuth } from "./AuthContext";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const items = [
    { key: "/jobs", label: "Jobs" },
    { key: "/products", label: "Products / Services" },
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
    const { user, logout } = useAuth();

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
                    <img className="AppHeader__logo" src="/logo.svg" alt="Liberland Marketplace" />
                    <span className="AppHeader__name">Liberland Marketplace</span>
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
                        {user ? (
                            <Space className="AppHeader__auth">
                                <span className="AppHeader__user"><UserOutlined /> {user.name || user.email}</span>
                                <Button size="small" icon={<LogoutOutlined />} onClick={logout}>Log Out</Button>
                            </Space>
                        ) : (
                            <Button icon={<LoginOutlined />} onClick={() => navigate("/login")}>Log In</Button>
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
                                    <img className="AppHeader__logo" src="/logo.svg" alt="Liberland Marketplace" />
                                    <span className="AppHeader__name">Liberland Marketplace</span>
                                </div>
                            }
                        >
                            <Menu
                                mode="inline"
                                items={[
                                    ...items,
                                    { type: "divider" } as any,
                                    user
                                        ? { key: "logout", label: `Log Out (${user.name || user.email})`, icon: <LogoutOutlined /> }
                                        : { key: "/login", label: "Log In", icon: <LoginOutlined /> },
                                ]}
                                selectedKeys={selectedKeys}
                                onClick={(info) => {
                                    if (info.key === "logout") {
                                        logout();
                                    }
                                    onMenuClick(info);
                                }}
                            />
                        </Drawer>
                    </Space>
                )}
            </div>
        </Header>
    );
};
