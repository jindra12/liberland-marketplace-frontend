import * as React from "react";
import { Layout } from "antd";
import { Link, useLocation } from "react-router-dom";

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
            <Layout.Footer>
                <div className="AppLayout__footerInner">
                    <nav className="AppLayout__footerNav">
                        <Link to="/companies">Companies</Link>
                        <Link to="/products-services">Products</Link>
                        <Link to="/jobs">Jobs</Link>
                        <Link to="/ventures">Ventures</Link>
                        <Link to="/tribes">Tribes</Link>
                    </nav>
                    <div className="AppLayout__footerCopy">
                        © {new Date().getFullYear()} NSwap — Your syndicated free marketplace
                    </div>
                </div>
            </Layout.Footer>
        </Layout>
    );
};

export default AppLayout;
