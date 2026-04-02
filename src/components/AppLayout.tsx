import * as React from "react";

import { useLocation } from "react-router-dom";

import { Layout } from "antd";

import { AppHeader } from "./AppHeader";

const AppLayout: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const location = useLocation();
    const isSplash = location.pathname === "/";

    return (
        <Layout className="AppLayout">
            <AppHeader />
            <Layout.Content className={`AppLayout__content${isSplash ? " AppLayout__content--splash" : ""}`}>
                {isSplash ? (
                    props.children
                ) : (
                    <div className="AppLayout__container">
                        <div className="AppLayout__surface">{props.children}</div>
                    </div>
                )}
            </Layout.Content>
            <Layout.Footer className="AppLayout__footer">
                <span className="AppLayout__footerText">© {new Date().getFullYear()} NSwap</span>
            </Layout.Footer>
        </Layout>
    );
};

export default AppLayout;
