import * as React from "react";

import { useSearchParams } from "react-router-dom";

import { Alert, Card } from "antd";

import { HostedCheckoutForm } from "./HostedCheckoutForm";
import { HostedSessionView } from "./HostedSessionView";
import { checkoutServerSchema } from "./utils";

const HostedCheckout: React.FunctionComponent = () => {
    const [params] = useSearchParams();
    const server = checkoutServerSchema.safeParse(params.get("serverUrl"));
    if (!server.success) {
        return <Alert type="error" message="This payment link has an invalid marketplace backend URL." />;
    }

    const serverUrl = server.data.replace(/\/$/, "");
    const sessionId = params.get("session");
    const companyId = params.get("companyId") || "";

    if (!sessionId && !companyId) {
        return <Alert type="error" message="This payment link is missing its company." />;
    }

    return (
        <Card>
            {sessionId ? (
                <HostedSessionView serverUrl={serverUrl} sessionId={sessionId} />
            ) : (
                <HostedCheckoutForm
                    serverUrl={serverUrl}
                    companyId={companyId}
                    productId={params.get("productId")}
                    quantity={Number(params.get("quantity") || 1)}
                />
            )}
        </Card>
    );
};

// Lazy-loaded route components require a default export.
// eslint-disable-next-line import/no-default-export
export default HostedCheckout;
