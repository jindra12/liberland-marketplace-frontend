import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ThirdwebProvider } from "thirdweb/react";

import { AntProvider } from "./components/AntProvider";
import { AppRouteTitle } from "./components/AppRouteTitle";
import { EndpointContextProvider } from "./components/EndpointContext";
import { RouteErrorFallback } from "./components/RouteErrorFallback";
import { RouteScrollToTop } from "./components/RouteScrollToTop";
import { AuthContextProvider } from "./components/AuthContext";
import { TronContext } from "./components/crypto/TronContext";
import { SolanaContext } from "./components/crypto/SolanaContext";
import { CartMutationProvider } from "./components/cart/CartMutationContext";
import { AppBootSkeleton } from "./components/LoadingSkeleton/AppBootSkeleton";
import { RouteSurfaceSkeleton } from "./components/LoadingSkeleton/RouteSurfaceSkeleton";
import { AppAnalyticsProvider } from "./components/analytics/AppAnalyticsProvider";

const Splash = React.lazy(() => import("./components/Splash"));
const Jobs = React.lazy(() => import("./components/Jobs"));
const Companies = React.lazy(() => import("./components/Companies"));
const Identities = React.lazy(() => import("./components/Identities"));
const ProductsServices = React.lazy(() => import("./components/ProductsServices"));
const Syndication = React.lazy(() => import("./components/Syndication"));
const Job = React.lazy(() => import("./components/detail/JobDetail"));
const Company = React.lazy(() => import("./components/detail/CompanyDetail"));
const Identity = React.lazy(() => import("./components/detail/IdentityDetail"));
const ProductService = React.lazy(() => import("./components/detail/ProductServiceDetail"));
const SyndicationDetail = React.lazy(() => import("./components/detail/SyndicationDetail"));
const AppLayout = React.lazy(() => import("./components/AppLayout"));
const Profile = React.lazy(() => import("./components/Profile"));
const Publish = React.lazy(() => import("./components/Publish"));
const EditJob = React.lazy(() => import("./components/edit/EditJob"));
const EditCompany = React.lazy(() => import("./components/edit/EditCompany"));
const EditProduct = React.lazy(() => import("./components/edit/EditProduct"));
const Startups = React.lazy(() => import("./components/Startups"));
const Startup = React.lazy(() => import("./components/detail/StartupDetail"));
const EditStartup = React.lazy(() => import("./components/edit/EditStartup"));
const AuthCallback = React.lazy(() => import("./components/AuthCallback"));
const Cart = React.lazy(() => import("./components/Cart"));
const Order = React.lazy(() => import("./components/Order"));
const Unsubscribe = React.lazy(() => import("./components/Unsubscribe/Unsubscribe"));
const NotFound = React.lazy(() => import("./components/NotFound"));

const suspense = (Component: React.FunctionComponent) => () => (
    <ErrorBoundary fallbackRender={({ error }) => (
        <RouteErrorFallback error={error instanceof Error ? error : undefined} />
    )}>
        <React.Suspense fallback={<RouteSurfaceSkeleton />}>
            <Component />
        </React.Suspense>
    </ErrorBoundary>
);

const config = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        },
    },
});

const Main: React.FunctionComponent = () => (
    <QueryClientProvider client={config}>
        <HelmetProvider>
            <EndpointContextProvider>
                <TronContext>
                    <SolanaContext>
                        <ThirdwebProvider>
                            <AuthContextProvider>
                                <BrowserRouter>
                                    <AppAnalyticsProvider>
                                        <AppRouteTitle />
                                        <RouteScrollToTop>
                                            <CartMutationProvider>
                                                <AntProvider>
                                                    <React.Suspense fallback={<AppBootSkeleton />}>
                                                        <AppLayout>
                                                            <Routes>
                                                                <Route Component={suspense(Splash)} path="/" />
                                                                <Route Component={suspense(Jobs)} path="/jobs" />
                                                                <Route Component={suspense(Companies)} path="/companies" />
                                                                <Route Component={suspense(Identities)} path="/tribes" />
                                                                <Route Component={suspense(ProductsServices)} path="/products-services" />
                                                                <Route Component={suspense(Syndication)} path="/syndication" />
                                                                <Route Component={suspense(Job)} path="/jobs/:id" />
                                                                <Route Component={suspense(Company)} path="/companies/:id" />
                                                                <Route Component={suspense(Identity)} path="/tribes/:id" />
                                                                <Route Component={suspense(ProductService)} path="/products-services/:id" />
                                                                <Route Component={suspense(SyndicationDetail)} path="/syndication/:id" />
                                                                <Route Component={suspense(Profile)} path="/profile" />
                                                                <Route Component={suspense(Publish)} path="/publish" />
                                                                <Route Component={suspense(EditJob)} path="/jobs/edit/:id" />
                                                                <Route Component={suspense(EditCompany)} path="/companies/edit/:id" />
                                                                <Route Component={suspense(EditProduct)} path="/products-services/edit/:id" />
                                                                <Route Component={suspense(Cart)} path="/cart" />
                                                                <Route Component={suspense(Order)} path="/order" />
                                                                <Route Component={suspense(Startups)} path="/ventures" />
                                                                <Route Component={suspense(Startup)} path="/ventures/:id" />
                                                                <Route Component={suspense(EditStartup)} path="/ventures/edit/:id" />
                                                                <Route Component={suspense(Unsubscribe)} path="/unsubscribe" />
                                                                <Route Component={suspense(AuthCallback)} path="/auth/callback" />
                                                                <Route Component={suspense(NotFound)} path="*" />
                                                            </Routes>
                                                        </AppLayout>
                                                    </React.Suspense>
                                                </AntProvider>
                                            </CartMutationProvider>
                                        </RouteScrollToTop>
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

export default Main;
