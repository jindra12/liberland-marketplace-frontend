import * as React from "react";

import { useQuery } from "@tanstack/react-query";

import { Alert, Skeleton } from "antd";

import { HostedPayment } from "./HostedPayment";
import { getHostedSession } from "./utils";

interface HostedSessionViewProps {
    serverUrl: string;
    sessionId: string;
}

export const HostedSessionView: React.FunctionComponent<HostedSessionViewProps> = (props) => {
    const query = useQuery({
        queryKey: ["hosted-checkout", props.serverUrl, props.sessionId],
        queryFn: () => getHostedSession(props.serverUrl, props.sessionId),
        refetchInterval: (state) => (state.state.data?.status === "paid" || state.state.error ? false : 3000),
        retry: false,
    });
    if (query.isPending) {
        return <Skeleton active />;
    }
    if (query.error) {
        return <Alert type="error" message={query.error.message} />;
    }
    return <HostedPayment session={query.data} />;
};
