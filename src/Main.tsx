import * as React from "react";

import { Route, Routes } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AnalyticsPageTracker } from "./components/analytics/AnalyticsPageTracker";
import { AppProviders } from "./components/AppProviders";
import { RouteErrorBoundary } from "./components/ErrorBoundary/RouteErrorBoundary";
import { AppBootSkeleton } from "./components/LoadingSkeleton/AppBootSkeleton";
import { RouteSurfaceSkeleton } from "./components/LoadingSkeleton/RouteSurfaceSkeleton";
import { ServerUrlGuard } from "./components/ServerUrlGuard";
import { TourService } from "./components/tour/TourService";
import { routes } from "./routes";

const Splash = React.lazy(() => import("./components/Splash"));
const Jobs = React.lazy(() => import("./components/Jobs"));
const Companies = React.lazy(() => import("./components/Companies"));
const Identities = React.lazy(() => import("./components/Identities"));
const ProductsServices = React.lazy(() => import("./components/ProductsServices"));
const Posts = React.lazy(() => import("./components/Posts"));
const Syndication = React.lazy(() => import("./components/Syndication"));
const Syndicate = React.lazy(() => import("./components/Syndicate"));
const Job = React.lazy(() => import("./components/detail/JobDetail"));
const Company = React.lazy(() => import("./components/detail/CompanyDetail"));
const Identity = React.lazy(() => import("./components/detail/IdentityDetail"));
const ProductService = React.lazy(() => import("./components/detail/ProductServiceDetail"));
const Post = React.lazy(() => import("./components/detail/PostDetail"));
const CommentDetail = React.lazy(() => import("./components/comments/CommentDetail"));
const SyndicationDetail = React.lazy(() => import("./components/detail/SyndicationDetail"));
const AppLayout = React.lazy(() => import("./components/AppLayout"));
const Profile = React.lazy(() => import("./components/Profile"));
const Publish = React.lazy(() => import("./components/Publish"));
const EditJob = React.lazy(() => import("./components/edit/EditJob"));
const EditCompany = React.lazy(() => import("./components/edit/EditCompany"));
const EditProduct = React.lazy(() => import("./components/edit/EditProduct"));
const EditPost = React.lazy(() => import("./components/edit/EditPost"));
const Startups = React.lazy(() => import("./components/Startups"));
const Startup = React.lazy(() => import("./components/detail/StartupDetail"));
const EditStartup = React.lazy(() => import("./components/edit/EditStartup"));
const AuthCallback = React.lazy(() => import("./components/AuthCallback"));
const Cart = React.lazy(() => import("./components/Cart"));
const Order = React.lazy(() => import("./components/Order"));
const Unsubscribe = React.lazy(() => import("./components/Unsubscribe/Unsubscribe"));
const NotFound = React.lazy(() => import("./components/NotFound"));

type SuspenseRouteOptions = {
    trackPage?: boolean;
    serverUrlGuard?: boolean;
};

const suspense =
    (Component: React.FunctionComponent, options: SuspenseRouteOptions = {}) =>
    () => (
        <RouteErrorBoundary>
            <React.Suspense fallback={<RouteSurfaceSkeleton />}>
                {options.serverUrlGuard ? (
                    <ServerUrlGuard>
                        {options.trackPage && <AnalyticsPageTracker />}
                        <TourService />
                        <Component />
                    </ServerUrlGuard>
                ) : (
                    <>
                        {options.trackPage && <AnalyticsPageTracker />}
                        <TourService />
                        <Component />
                    </>
                )}
            </React.Suspense>
        </RouteErrorBoundary>
    );

const Main: React.FunctionComponent = () => {
    const config = React.useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnMount: false,
                        refetchOnReconnect: false,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
        [],
    );

    return (
        <QueryClientProvider client={config}>
            <AppProviders>
                <React.Suspense fallback={<AppBootSkeleton />}>
                    <AppLayout>
                        <Routes>
                            <Route
                                Component={suspense(Splash, {
                                    trackPage: true,
                                })}
                                path={routes.home.route}
                            />
                            <Route
                                Component={suspense(Jobs, {
                                    trackPage: true,
                                })}
                                path={routes.jobs.route}
                            />
                            <Route
                                Component={suspense(Companies, {
                                    trackPage: true,
                                })}
                                path={routes.companies.route}
                            />
                            <Route
                                Component={suspense(Identities, {
                                    trackPage: true,
                                })}
                                path={routes.tribes.route}
                            />
                            <Route
                                Component={suspense(ProductsServices, {
                                    trackPage: true,
                                })}
                                path={routes.productsServices.route}
                            />
                            <Route
                                Component={suspense(Posts, {
                                    trackPage: true,
                                })}
                                path={routes.posts.route}
                            />
                            <Route
                                Component={suspense(Syndication, {
                                    trackPage: true,
                                })}
                                path={routes.syndication.route}
                            />
                            <Route
                                Component={suspense(Syndicate, {
                                    trackPage: true,
                                })}
                                path={routes.syndicate.route}
                            />
                            <Route
                                Component={suspense(Job, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.jobs.detail.route}
                            />
                            <Route
                                Component={suspense(Company, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.companies.detail.route}
                            />
                            <Route
                                Component={suspense(Identity, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.tribes.detail.route}
                            />
                            <Route
                                Component={suspense(ProductService, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.productsServices.detail.route}
                            />
                            <Route
                                Component={suspense(Post, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.posts.detail.route}
                            />
                            <Route
                                Component={suspense(CommentDetail, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.comments.detail.route}
                            />
                            <Route
                                Component={suspense(SyndicationDetail, {
                                    trackPage: false,
                                })}
                                path={routes.syndication.detail.route}
                            />
                            <Route
                                Component={suspense(Profile, {
                                    trackPage: true,
                                })}
                                path={routes.profile.route}
                            />
                            <Route
                                Component={suspense(Publish, {
                                    trackPage: true,
                                })}
                                path={routes.publish.route}
                            />
                            <Route
                                Component={suspense(EditJob, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.jobs.edit.route}
                            />
                            <Route
                                Component={suspense(EditCompany, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.companies.edit.route}
                            />
                            <Route
                                Component={suspense(EditProduct, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.productsServices.edit.route}
                            />
                            <Route
                                Component={suspense(EditPost, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.posts.edit.route}
                            />
                            <Route
                                Component={suspense(Cart, {
                                    trackPage: true,
                                })}
                                path={routes.cart.route}
                            />
                            <Route
                                Component={suspense(Order, {
                                    trackPage: true,
                                })}
                                path={routes.order.route}
                            />
                            <Route
                                Component={suspense(Startups, {
                                    trackPage: true,
                                })}
                                path={routes.ventures.route}
                            />
                            <Route
                                Component={suspense(Startup, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.ventures.detail.route}
                            />
                            <Route
                                Component={suspense(EditStartup, {
                                    trackPage: false,
                                    serverUrlGuard: true,
                                })}
                                path={routes.ventures.edit.route}
                            />
                            <Route
                                Component={suspense(Unsubscribe, {
                                    trackPage: true,
                                })}
                                path={routes.unsubscribe.route}
                            />
                            <Route
                                Component={suspense(AuthCallback, {
                                    trackPage: true,
                                })}
                                path={routes.authCallback.route}
                            />
                            <Route
                                Component={suspense(NotFound, {
                                    trackPage: true,
                                })}
                                path="*"
                            />
                        </Routes>
                        </AppLayout>
                    </React.Suspense>
                </AppProviders>
            </QueryClientProvider>
    );
};

export default Main;
