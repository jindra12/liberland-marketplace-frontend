import { useQueryClient } from "@tanstack/react-query";

import { message } from "antd";

import { invalidateStartupQueries } from "../../../startupUtils";
import { useJoinStartupMutation, useLeaveStartupMutation } from "../../hooks";
import { useIsOwnedByServerUser } from "../useIsOwnedByServerUser";
import { useServerUser } from "../../auth/useServerUser";

import type { StartupDetailEntity } from "./types";

type UseStartupInvolvementProps = {
    startup: Pick<StartupDetailEntity, "id" | "serverURL" | "involvedUsers"> & {
        createdBy?: StartupDetailEntity["createdBy"];
    };
};

export const useStartupInvolvement = (props: UseStartupInvolvementProps) => {
    const serverUser = useServerUser(props.startup.serverURL);
    const queryClient = useQueryClient();
    const joinMutation = useJoinStartupMutation();
    const leaveMutation = useLeaveStartupMutation();
    const userId = serverUser.user?.id;
    const involvedUsers = props.startup.involvedUsers || [];
    const isOwner = useIsOwnedByServerUser({
        ownerUserId: props.startup.createdBy?.id,
        serverURL: props.startup.serverURL,
    });

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
        isAuthenticated: Boolean(serverUser.user),
        isInvolved: userId ? involvedUsers.some((user) => user.id === userId) : false,
        isJoinPending: joinMutation.isPending,
        isLeavePending: leaveMutation.isPending,
        isOwner,
    };
};
