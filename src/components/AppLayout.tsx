import * as React from "react";
import { Layout } from "antd";

import { AppHeader } from "./AppHeader";

const AppLayout: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <Layout className="AppLayout">
            <AppHeader />
            <Layout.Content>{props.children}</Layout.Content>
            <Layout.Footer>© {new Date().getFullYear()} Jita-44</Layout.Footer>
        </Layout>
    );
};

export default AppLayout;