import * as React from "react";

import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

import { routes } from "../routes";

const APP_NAME = "NSwap";

const routeTitles: Array<{ path: string; title: string }> = [
    { path: routes.jobs.edit.route, title: "Edit Job" },
    { path: routes.companies.edit.route, title: "Edit Company" },
    { path: routes.productsServices.edit.route, title: "Edit Product / Service" },
    { path: routes.posts.edit.route, title: "Edit Post" },
    { path: routes.ventures.edit.route, title: "Edit Venture" },
    { path: routes.jobs.detail.route, title: "Job" },
    { path: routes.companies.detail.route, title: "Company" },
    { path: routes.posts.detail.route, title: "Post" },
    { path: routes.tribes.detail.route, title: "Tribe" },
    { path: routes.productsServices.detail.route, title: "Product / Service" },
    { path: routes.syndication.detail.route, title: "Syndication Detail" },
    { path: routes.ventures.detail.route, title: "Venture" },
    { path: routes.jobs.route, title: "Jobs" },
    { path: routes.companies.route, title: "Companies" },
    { path: routes.posts.route, title: "Posts" },
    { path: routes.tribes.route, title: "Tribes" },
    { path: routes.productsServices.route, title: "Products / Services" },
    { path: routes.syndication.route, title: "Syndication" },
    { path: routes.profile.route, title: "Profile" },
    { path: routes.publish.route, title: "Publish" },
    { path: routes.cart.route, title: "Cart" },
    { path: routes.order.route, title: "Order" },
    { path: routes.unsubscribe.route, title: "Unsubscribe" },
    { path: routes.ventures.route, title: "Ventures" },
    { path: routes.authCallback.route, title: "Signing In" },
    { path: routes.home.route, title: APP_NAME },
];

const getRouteTitle = (pathname: string): string => {
    const match = routeTitles.find((route) => Boolean(matchPath({ path: route.path, end: true }, pathname)));

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
