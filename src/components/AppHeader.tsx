import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Button, Grid, Space, Flex, Tag } from "antd";

import { routes } from "../routes";

import { CartHeaderButton } from "./cart/CartHeaderButton";
import { useCartItems } from "./cart/useCartItems";
import { DesktopDrawer } from "./DesktopDrawer";
import { EndpointAuthAction } from "./EndpointAuthAction/EndpointAuthAction";
import { LoginButton } from "./LoginButton";
import { MobileDrawer } from "./MobileDrawer";
import { getSelectedKeys } from "./MobileDrawer/utils";
import { OrderHeaderButton } from "./orderList/OrderHeaderButton";
import { useOrderSummary } from "./orderList/useOrderSummary";

const { Header } = Layout;
const { useBreakpoint } = Grid;

type DesktopNavItem = {
    key: string;
    label: React.ReactNode;
};

const desktopBaseItems: DesktopNavItem[] = [
    { key: routes.jobs.route, label: "Jobs" },
    { key: routes.productsServices.route, label: "Market" },
    { key: routes.companies.route, label: "Companies" },
    { key: routes.ventures.route, label: "Ventures" },
    { key: routes.tribes.route, label: "Tribes" },
];

export const AppHeader: React.FunctionComponent = () => {
    const { xl } = useBreakpoint();
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { totalQuantity } = useCartItems();
    const orderSummary = useOrderSummary(auth.isAuthenticated);

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    React.useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    const desktopItems = React.useMemo(() => {
        const nextItems: DesktopNavItem[] = [...desktopBaseItems];

        if (totalQuantity > 0) {
            nextItems.push({ key: routes.cart.route, label: "Cart" });
        }

        if (orderSummary.hasOrders) {
            nextItems.push({
                key: routes.orders.route,
                label: (
                    <Flex align="center" gap={6}>
                        <span>Orders</span>
                        {orderSummary.pendingCount > 0 ? (
                            <Tag color="red" className="AppHeader__ordersTag">
                                {orderSummary.pendingCount}
                            </Tag>
                        ) : null}
                    </Flex>
                ),
            });
        }

        return nextItems;
    }, [orderSummary.hasOrders, orderSummary.pendingCount, totalQuantity]);

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
                                {({ runWithEndpointSelection }) => (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        className="AppHeader__publishBtn"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            runWithEndpointSelection(() => {
                                                navigate(routes.publish.route);
                                            });
                                        }}
                                    >
                                        Create
                                    </Button>
                                )}
                            </EndpointAuthAction>
                            <LoginButton
                                className="AppHeader__authBtn"
                            />
                            <DesktopDrawer />
                        </Flex>
                    </>
                ) : (
                    <Space className="AppHeader__mobile" align="center" size={8}>
                        <LoginButton
                            className="AppHeader__mobileAuthBtn"
                        />
                        {totalQuantity > 0 && <CartHeaderButton className="AppHeader__iconButton" />}
                        {orderSummary.hasOrders ? (
                            <OrderHeaderButton
                                className="AppHeader__iconButton"
                                pendingCount={orderSummary.pendingCount}
                            />
                        ) : null}
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
