import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

    const drawerItems = totalQuantity > 0 ? [...mobileDrawerBaseItems, { key: "/cart", label: "Cart" }] : mobileDrawerBaseItems;
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
        onPublish: () => {
            navigate("/publish");
            onClose();
        },
        onUnauthorizedBeforeLogin: onClose,
        onProfile: () => {
            navigate("/profile");
            onClose();
        },
    };
};
