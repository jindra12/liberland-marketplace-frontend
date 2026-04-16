import type { MenuProps } from "antd";

export type MobileDrawerModel = {
    menuItems: MenuProps["items"];
    selectedKeys: string[];
    showSyndication: boolean;
    isAuthenticated: boolean;
    onSearchScopeSelect: () => void;
    onPublish: () => void;
    onUnauthorizedBeforeLogin: () => void;
    onProfile: () => void;
};
