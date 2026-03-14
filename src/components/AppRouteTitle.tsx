import * as React from "react";
import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

type RouteTitle = {
    path: string;
    title: string;
};

const APP_NAME = "NSwap";

const routeTitles: RouteTitle[] = [
    { path: "/jobs/edit/:id", title: "Edit Job" },
    { path: "/companies/edit/:id", title: "Edit Company" },
    { path: "/products-services/edit/:id", title: "Edit Product / Service" },
    { path: "/ventures/edit/:id", title: "Edit Venture" },
    { path: "/jobs/:id", title: "Job" },
    { path: "/companies/:id", title: "Company" },
    { path: "/tribes/:id", title: "Tribe" },
    { path: "/products-services/:id", title: "Product / Service" },
    { path: "/syndication/:id", title: "Syndication Detail" },
    { path: "/ventures/:id", title: "Venture" },
    { path: "/jobs", title: "Jobs" },
    { path: "/companies", title: "Companies" },
    { path: "/tribes", title: "Tribes" },
    { path: "/products-services", title: "Products / Services" },
    { path: "/syndication", title: "Syndication" },
    { path: "/profile", title: "Profile" },
    { path: "/publish", title: "Publish" },
    { path: "/cart", title: "Cart" },
    { path: "/order", title: "Order" },
    { path: "/ventures", title: "Ventures" },
    { path: "/auth/callback", title: "Signing In" },
    { path: "/", title: APP_NAME },
];

const getRouteTitle = (pathname: string): string => {
    const match = routeTitles.find((route) =>
        Boolean(matchPath({ path: route.path, end: true }, pathname))
    );

    if (!match) {
        return `Not Found | ${APP_NAME}`;
    }

    return match.title === APP_NAME ? APP_NAME : `${match.title} | ${APP_NAME}`;
};

export const AppRouteTitle: React.FunctionComponent = () => {
    const location = useLocation();
    const title = React.useMemo(() => getRouteTitle(location.pathname), [location.pathname]);

    return (
        <Helmet>
            <title>{title}</title>
        </Helmet>
    );
};
