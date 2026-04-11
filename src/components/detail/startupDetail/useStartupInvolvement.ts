import { useQueryClient } from "@tanstack/react-query";

import { message } from "antd";
import { useAuth } from "react-oidc-context";

import { invalidateStartupQueries } from "../../../startupUtils";
import { useJoinStartupMutation, useLeaveStartupMutation } from "../../hooks";

import type { StartupDetailEntity } from "./types";

type UseStartupInvolvementProps = {
    startup: StartupDetailEntity;
};

export const useStartupInvolvement = (props: UseStartupInvolvementProps) => {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const joinMutation = useJoinStartupMutation();
    const leaveMutation = useLeaveStartupMutation();
    const userId = auth.user?.profile?.sub;
    const involvedUsers = props.startup.involvedUsers || [];

    const handleJoin = async () => {
        try {
            await joinMutation.mutateAsync({
                id: props.startup.id,
                url: props.startup.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            message.success("You joined this venture!");
        } catch (error) {
            console.error(error);
            message.error("Failed to join venture");
        }
    };

    const handleLeave = async () => {
        try {
            await leaveMutation.mutateAsync({
                id: props.startup.id,
                url: props.startup.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            message.success("You left this venture");
        } catch (error) {
            console.error(error);
            message.error("Failed to leave venture");
        }
    };

    return {
        handleJoin,
        handleLeave,
        isAuthenticated: Boolean(auth.isAuthenticated),
        isInvolved: userId ? involvedUsers.some((user) => user.id === userId) : false,
        isJoinPending: joinMutation.isPending,
        isLeavePending: leaveMutation.isPending,
        isOwner: Boolean(userId && props.startup.createdBy?.id === userId),
    };
};
