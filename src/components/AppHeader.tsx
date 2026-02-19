// src/layout/AppHeader.tsx
import React from "react";
import { Layout, Menu, Drawer, Button, Grid, Space, Flex, Avatar } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginOutlined, MenuOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { SearchButton } from "./SearchButton";
import { useAuth } from "react-oidc-context";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const items = [
    { key: "/jobs", label: "Jobs" },
    { key: "/products-services", label: "Market" },
    { key: "/companies", label: "Companies" },
    { key: "/startups", label: "Startups" },
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

    const handlePublish = () => {
        if (auth.isAuthenticated) {
            navigate("/publish");
        } else {
            auth.signinRedirect();
        }
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
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handlePublish}
                        >
                            Publish your ad
                        </Button>
                        {auth.isAuthenticated ? (
                            <Link to="/profile">
                                <Avatar
                                    className="AppHeader__avatar"
                                    size="default"
                                    src={auth.user?.profile?.picture}
                                    icon={<UserOutlined />}
                                />
                            </Link>
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
                            <div className="AppHeader__drawerNav">
                                <Button
                                    block
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => { handlePublish(); setDrawerOpen(false); }}
                                    className="AppHeader__drawerPublish"
                                >
                                    Publish your ad
                                </Button>
                                {auth.isAuthenticated ? (
                                    <Button
                                        block
                                        icon={<UserOutlined />}
                                        onClick={() => { navigate("/profile"); setDrawerOpen(false); }}
                                    >
                                        Profile
                                    </Button>
                                ) : (
                                    <Button
                                        block
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
