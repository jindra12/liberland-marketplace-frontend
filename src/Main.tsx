import * as React from "react";

import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CypressHistorySupport } from "cypress-react-router";
import { ThirdwebProvider } from "thirdweb/react";

import { AnalyticsPageTracker } from "./components/analytics/AnalyticsPageTracker";
import { AppAnalyticsProvider } from "./components/analytics/AppAnalyticsProvider";
import { AntProvider } from "./components/AntProvider";
import { AppRouteTitle } from "./components/AppRouteTitle";
import { AuthContextProvider } from "./components/AuthContext";
import { CartMutationProvider } from "./components/cart/CartMutationContext";
import { SolanaContext } from "./components/crypto/SolanaContext";
import { TronContext } from "./components/crypto/TronContext";
import { EndpointContextProvider } from "./components/EndpointContext";
import { AppErrorBoundary } from "./components/ErrorBoundary/AppErrorBoundary";
import { RouteErrorBoundary } from "./components/ErrorBoundary/RouteErrorBoundary";
import { AppBootSkeleton } from "./components/LoadingSkeleton/AppBootSkeleton";
import { RouteSurfaceSkeleton } from "./components/LoadingSkeleton/RouteSurfaceSkeleton";
import { RouteScrollToTop } from "./components/RouteScrollToTop";
import { routes } from "./routes";

const Splash = React.lazy(() => import("./components/Splash"));
const Jobs = React.lazy(() => import("./components/Jobs"));
const Companies = React.lazy(() => import("./components/Companies"));
const Identities = React.lazy(() => import("./components/Identities"));
const ProductsServices = React.lazy(() => import("./components/ProductsServices"));
const Posts = React.lazy(() => import("./components/Posts"));
const Syndication = React.lazy(() => import("./components/Syndication"));
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
};

const suspense =
    (Component: React.FunctionComponent, options: SuspenseRouteOptions = {}) =>
    () => (
        <RouteErrorBoundary>
            <React.Suspense fallback={<RouteSurfaceSkeleton />}>
                {options.trackPage !== false && <AnalyticsPageTracker />}
                <Component />
            </React.Suspense>
        </RouteErrorBoundary>
    );

const Main: React.FunctionComponent = () => {
    const [config] = React.useState(
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
    );

    return (
        <QueryClientProvider client={config}>
            <HelmetProvider>
                <EndpointContextProvider>
                    <TronContext>
                        <SolanaContext>
                            <ThirdwebProvider>
                                <AuthContextProvider>
                                    <BrowserRouter>
                                        <CypressHistorySupport />
                                        <AppAnalyticsProvider>
                                            <AntProvider>
                                                <AppErrorBoundary>
                                                    <AppRouteTitle />
                                                    <RouteScrollToTop>
                                                        <CartMutationProvider>
                                                            <React.Suspense fallback={<AppBootSkeleton />}>
                                                                <AppLayout>
                                                                    <Routes>
                                                                        <Route
                                                                            Component={suspense(Splash)}
                                                                            path={routes.home.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Jobs)}
                                                                            path={routes.jobs.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Companies)}
                                                                            path={routes.companies.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Identities)}
                                                                            path={routes.tribes.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(ProductsServices)}
                                                                            path={routes.productsServices.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Posts)}
                                                                            path={routes.posts.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Syndication)}
                                                                            path={routes.syndication.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Job, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.jobs.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Company, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.companies.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Identity, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.tribes.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(ProductService, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.productsServices.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Post, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.posts.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(CommentDetail, {
                                                                                trackPage: false,
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
                                                                            Component={suspense(Profile)}
                                                                            path={routes.profile.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Publish)}
                                                                            path={routes.publish.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(EditJob, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.jobs.edit.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(EditCompany, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.companies.edit.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(EditProduct, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.productsServices.edit.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(EditPost, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.posts.edit.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Cart)}
                                                                            path={routes.cart.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Order)}
                                                                            path={routes.order.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Startups)}
                                                                            path={routes.ventures.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Startup, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.ventures.detail.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(EditStartup, {
                                                                                trackPage: false,
                                                                            })}
                                                                            path={routes.ventures.edit.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(Unsubscribe)}
                                                                            path={routes.unsubscribe.route}
                                                                        />
                                                                        <Route
                                                                            Component={suspense(AuthCallback)}
                                                                            path={routes.authCallback.route}
                                                                        />
                                                                        <Route Component={suspense(NotFound)} path="*" />
                                                                    </Routes>
                                                                </AppLayout>
                                                            </React.Suspense>
                                                        </CartMutationProvider>
                                                    </RouteScrollToTop>
                                                </AppErrorBoundary>
                                            </AntProvider>
                                        </AppAnalyticsProvider>
                                    </BrowserRouter>
                                </AuthContextProvider>
                            </ThirdwebProvider>
                        </SolanaContext>
                    </TronContext>
                </EndpointContextProvider>
            </HelmetProvider>
        </QueryClientProvider>
    );
};

export default Main;
