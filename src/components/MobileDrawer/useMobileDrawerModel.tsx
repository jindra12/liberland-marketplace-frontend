import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { routes } from "../../routes";
import { useCartItems } from "../cart/useCartItems";
import { useEndpointContext } from "../EndpointContext";

import { mobileDrawerBaseItems } from "./constants";
import type { MobileDrawerModel } from "./types";
import { getSelectedKeys } from "./utils";

export const useMobileDrawerModel = (onClose: () => void): MobileDrawerModel => {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const { urls } = useEndpointContext();
    const { totalQuantity } = useCartItems();

    const drawerItems = totalQuantity > 0 ? [...mobileDrawerBaseItems, { key: routes.cart.route, label: "Cart" }] : mobileDrawerBaseItems;
    const selectedKeys = getSelectedKeys(location.pathname, drawerItems);
    const menuItems = drawerItems.map((item) => ({
        key: item.key,
        label: (
            <Link to={item.key} className="AppHeader__drawerMenuLink" onClick={onClose}>
                {item.label}
            </Link>
        ),
    }));

    return {
        menuItems,
        selectedKeys,
        showSyndication: urls.length > 1,
        isAuthenticated: auth.isAuthenticated,
        onSearchScopeSelect: onClose,
        onOpenDisclaimers: onClose,
        onPublish: () => {
            navigate(routes.publish.route);
            onClose();
        },
        onUnauthorizedBeforeLogin: onClose,
        onProfile: () => {
            navigate(routes.profile.route);
            onClose();
        },
    };
};
