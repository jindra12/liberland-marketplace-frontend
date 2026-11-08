import * as React from "react";

import { HelmetProvider } from "react-helmet-async";


import { CypressHistorySupport } from "cypress-react-router";
import { ThirdwebProvider } from "thirdweb/react";

import { AppAnalyticsProvider } from "./analytics/AppAnalyticsProvider";
import { AntProvider } from "./AntProvider";
import { AppRouter } from "./AppRouter";
import { AppRouteTitle } from "./AppRouteTitle";
import { LoginSuccessMessageService } from "./auth/LoginSuccessMessageService";
import { AuthContextProvider } from "./AuthContext";
import { CartMutationProvider } from "./cart/CartMutationContext";
import { SolanaContext } from "./crypto/SolanaContext";
import { TronContext } from "./crypto/TronContext";
import { DisclaimersService } from "./disclaimers/DisclaimersService";
import { EndpointContextProvider } from "./EndpointContext";
import { EndpointPendingActionHost } from "./EndpointPendingActionHost";
import { SyndicationNsfwService } from "./endpoints/SyndicationNsfwService";
import { AppErrorBoundary } from "./ErrorBoundary/AppErrorBoundary";
import { RouteScrollToTop } from "./RouteScrollToTop";

export interface AppProvidersProps {
    children: React.ReactNode;
}

export const AppProviders: React.FunctionComponent<AppProvidersProps> = (props) => {
    return (
        <HelmetProvider>
            <EndpointContextProvider>
                <TronContext>
                    <SolanaContext>
                        <ThirdwebProvider>
                            <AppRouter>
                                <AuthContextProvider>
                                    <EndpointPendingActionHost />
                                    <CypressHistorySupport />
                                    <AppAnalyticsProvider>
                                        <AntProvider>
                                            <LoginSuccessMessageService />
                                            <AppErrorBoundary>
                                                <AppRouteTitle />
                                                <RouteScrollToTop>
                                                    <CartMutationProvider>
                                                        <SyndicationNsfwService>
                                                            <DisclaimersService>{props.children}</DisclaimersService>
                                                        </SyndicationNsfwService>
                                                    </CartMutationProvider>
                                                </RouteScrollToTop>
                                            </AppErrorBoundary>
                                        </AntProvider>
                                    </AppAnalyticsProvider>
                                </AuthContextProvider>
                            </AppRouter>
                        </ThirdwebProvider>
                    </SolanaContext>
                </TronContext>
            </EndpointContextProvider>
        </HelmetProvider>
    );
};
