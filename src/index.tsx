import * as React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Spin } from "antd";

import { AntProvider } from "./components/AntProvider";
import { AuthProvider } from "./components/AuthContext";

import "./index.scss";

const Splash = React.lazy(() => import("./components/Splash"));
const Login = React.lazy(() => import("./components/Login"));
const Signup = React.lazy(() => import("./components/Signup"));
const Jobs = React.lazy(() => import("./components/Jobs"));
const Companies = React.lazy(() => import("./components/Companies"));
const Identities = React.lazy(() => import("./components/Identities"));
const ProductsServices = React.lazy(() => import("./components/ProductsServices"));
const Job = React.lazy(() => import("./components/detail/JobDetail"));
const Company = React.lazy(() => import("./components/detail/CompanyDetail"));
const Identity = React.lazy(() => import("./components/detail/IdentityDetail"));
const ProductService = React.lazy(() => import("./components/detail/ProductServiceDetail"));
const AppLayout = React.lazy(() => import("./components/AppLayout"));

const suspense = (Component: React.FunctionComponent) => () => (
    <React.Suspense fallback={<Spin />}>
        <Component />
    </React.Suspense>
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
const root = ReactDOM.createRoot(document.querySelector("#root")!);
root.render(
    <BrowserRouter>
        <QueryClientProvider client={config}>
            <AntProvider>
                <AuthProvider>
                <React.Suspense fallback={<Spin />}>
                    <AppLayout>
                        <Routes>
                            <Route Component={suspense(Splash)} path="/" />
                            <Route Component={suspense(Login)} path="/login" />
                            <Route Component={suspense(Signup)} path="/signup" />
                            <Route Component={suspense(Jobs)} path="/jobs" />
                            <Route Component={suspense(Companies)} path="/companies" />
                            <Route Component={suspense(Identities)} path="/identities" />
                            <Route Component={suspense(ProductsServices)} path="/products-services" />
                            <Route Component={suspense(Job)} path="/jobs/:id" />
                            <Route Component={suspense(Company)} path="/companies/:id" />
                            <Route Component={suspense(Identity)} path="/identities/:id" />
                            <Route Component={suspense(ProductService)} path="/products-services/:id" />
                        </Routes>
                    </AppLayout>
                </React.Suspense>
                </AuthProvider>
            </AntProvider>
        </QueryClientProvider>
    </BrowserRouter>
);