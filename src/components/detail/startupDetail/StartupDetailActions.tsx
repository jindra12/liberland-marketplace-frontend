import * as React from "react";

import { EditOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { Startup } from "../../../generated/graphql";
import { routes } from "../../../routes";
import { RouteButton } from "../../RouteButton";

import type { StartupDetailContentProps } from "./types";
import { useStartupInvolvement } from "./useStartupInvolvement";

export const StartupDetailActions: React.FunctionComponent<StartupDetailContentProps> = (props) => {
    const startupInvolvement = useStartupInvolvement({
        startup: props.startup,
    });

    return (
        <>
            {startupInvolvement.isAuthenticated && (
                <div className="StartupDetail__joinAction">
                    {startupInvolvement.isInvolved ? (
                        <Button
                            icon={<UserDeleteOutlined />}
                            onClick={startupInvolvement.handleLeave}
                            loading={startupInvolvement.isLeavePending}
                        >
                            Remove Involvement
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={startupInvolvement.handleJoin}
                            loading={startupInvolvement.isJoinPending}
                        >
                            Get Involved
                        </Button>
                    )}
                </div>
            )}
            {startupInvolvement.isOwner && (
                <RouteButton to={routes.ventures.edit.getLink(props.startup as Startup)} icon={<EditOutlined />}>
                    Edit
                </RouteButton>
            )}
        </>
    );
};
