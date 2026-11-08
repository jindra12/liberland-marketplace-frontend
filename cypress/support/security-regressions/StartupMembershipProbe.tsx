import React from "react";
import { Card, Skeleton, Space } from "antd";
import { useStartupByIdQuery } from "../../../src/components/hooks";
import { StartupDetailActions } from "../../../src/components/detail/startupDetail/StartupDetailActions";
import { StartupInvolvementButton } from "../../../src/components/lists/StartupInvolvementButton";

interface StartupMembershipProbeProps {
    id: string;
    serverURL: string;
}

export const StartupMembershipProbe: React.FunctionComponent<StartupMembershipProbeProps> = (props) => {
    const query = useStartupByIdQuery({ id: props.id, url: props.serverURL });
    if (!query.data?.Startup) {
        return <Skeleton active />;
    }
    return (
        <Space direction="vertical">
            <Card data-cy="detail-membership" title="Venture detail">
                <StartupDetailActions startup={query.data.Startup} startupId={props.id} serverURL={props.serverURL} />
            </Card>
            <Card data-cy="list-membership" title="Venture list">
                <StartupInvolvementButton startup={query.data.Startup} />
            </Card>
        </Space>
    );
};
