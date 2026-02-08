import * as React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AntProvider } from "./components/AntProvider";
import { Spin } from "antd";

const Splash = React.lazy(() => import("./components/Splash"));
const Jobs = React.lazy(() => import("./components/Jobs"));
const Companies = React.lazy(() => import("./components/Companies"));
const Identities = React.lazy(() => import("./components/Identities"));
const ProductsServices = React.lazy(() => import("./components/ProductsServices"));
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
                <React.Suspense fallback={<Spin />}>
                    <AppLayout>
                        <Routes>
                            <Route Component={suspense(Splash)} path="/" />
                            <Route Component={suspense(Jobs)} path="/jobs" />
                            <Route Component={suspense(Companies)} path="/companies" />
                            <Route Component={suspense(Identities)} path="/identities" />
                            <Route Component={suspense(ProductsServices)} path="/products-services" />
                        </Routes>
                    </AppLayout>
                </React.Suspense>
            </AntProvider>
        </QueryClientProvider>
    </BrowserRouter>
);