import * as React from "react";

import { UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

import type { ListStartupsQuery } from "../../generated/graphql";
import { useStartupInvolvement } from "../detail/startupDetail/useStartupInvolvement";

interface StartupInvolvementButtonProps {
    startup: NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];
    block?: boolean;
}

export const StartupInvolvementButton: React.FunctionComponent<StartupInvolvementButtonProps> = (props) => {
    const involvement = useStartupInvolvement(props);
    if (!involvement.isAuthenticated) {
        return null;
    }
    return (
        <Button
            type={involvement.isInvolved ? "default" : "primary"}
            icon={involvement.isInvolved ? <UserDeleteOutlined /> : <UserAddOutlined />}
            loading={involvement.isJoinPending || involvement.isLeavePending}
            size="large"
            block={props.block}
            onClick={async (event) => {
                event.preventDefault();
                if (involvement.isInvolved) {
                    await involvement.handleLeave();
                } else {
                    await involvement.handleJoin();
                }
            }}
        >
            {involvement.isInvolved ? "Remove Involvement" : "Get Involved"}
        </Button>
    );
};
