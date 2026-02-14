import * as React from "react";
import { Layout } from "antd";
import { useLocation } from "react-router-dom";

import { AppHeader } from "./AppHeader";

const AppLayout: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const location = useLocation();
    const isSplash = location.pathname === "/";

    return (
        <Layout className="AppLayout">
            <AppHeader />
            <Layout.Content>
                {isSplash ? props.children : <div className="AppLayout__container">{props.children}</div>}
            </Layout.Content>
            <Layout.Footer>© {new Date().getFullYear()} Jita-44</Layout.Footer>
        </Layout>
    );
};

export default AppLayout;
