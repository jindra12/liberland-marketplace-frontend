import * as React from "react";

import { createThirdwebClient, defineChain } from "thirdweb";
import { CheckoutWidget } from "thirdweb/react";

import type { HostedSession } from "./types";

interface HostedPaymentWidgetProps {
    session: HostedSession;
}

export const HostedPaymentWidget: React.FunctionComponent<HostedPaymentWidgetProps> = (props) => (
    <CheckoutWidget
        className="ThirdwebCheckoutWidget"
        client={createThirdwebClient({ clientId: props.session.thirdwebClientId })}
        chain={defineChain(props.session.settlement.chainId)}
        seller={props.session.receiver}
        tokenAddress={props.session.settlement.tokenAddress}
        amount={(props.session.amountUsdCents / 100).toFixed(2)}
        purchaseData={props.session.purchaseData}
        name={props.session.title}
        paymentMethods={["crypto", "card"]}
        feePayer="user"
        theme="dark"
    />
);
