import * as React from "react";

import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import { CypressHistorySupport } from "cypress-react-router";
import { ThirdwebProvider } from "thirdweb/react";

import { AppAnalyticsProvider } from "./analytics/AppAnalyticsProvider";
import { AntProvider } from "./AntProvider";
import { AppRouteTitle } from "./AppRouteTitle";
import { AuthContextProvider } from "./AuthContext";
import { CartMutationProvider } from "./cart/CartMutationContext";
import { SolanaContext } from "./crypto/SolanaContext";
import { TronContext } from "./crypto/TronContext";
import { DisclaimersService } from "./disclaimers/DisclaimersService";
import { EndpointContextProvider } from "./EndpointContext";
import { AppErrorBoundary } from "./ErrorBoundary/AppErrorBoundary";
import { PermissionsContextProvider } from "./PermissionsContext";
import { RouteScrollToTop } from "./RouteScrollToTop";

export interface AppProvidersProps {
    children: React.ReactNode;
}

export const AppProviders: React.FunctionComponent<AppProvidersProps> = (props) => {
    return (
        <HelmetProvider>
            <EndpointContextProvider>
                <PermissionsContextProvider>
                    <TronContext>
                        <SolanaContext>
                            <ThirdwebProvider>
                                <BrowserRouter>
                                    <AuthContextProvider>
                                        <CypressHistorySupport />
                                        <AppAnalyticsProvider>
                                            <AntProvider>
                                                <AppErrorBoundary>
                                                    <AppRouteTitle />
                                                    <RouteScrollToTop>
                                                        <CartMutationProvider>
                                                            <DisclaimersService>
                                                                {props.children}
                                                            </DisclaimersService>
                                                        </CartMutationProvider>
                                                    </RouteScrollToTop>
                                                </AppErrorBoundary>
                                            </AntProvider>
                                        </AppAnalyticsProvider>
                                    </AuthContextProvider>
                                </BrowserRouter>
                            </ThirdwebProvider>
                        </SolanaContext>
                    </TronContext>
                </PermissionsContextProvider>
            </EndpointContextProvider>
        </HelmetProvider>
    );
};
