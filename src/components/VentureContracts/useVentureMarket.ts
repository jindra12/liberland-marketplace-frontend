import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createVentureProposal, fetchVentureIndex, getVentureDaoClient, submitProposalAction } from "./marketUtils";
import type { ProposalRequest, ProposalValues, VentureMarketProps } from "./types";

export const useVenturePools = (props: VentureMarketProps) =>
    useQuery({
        queryKey: ["venture-pools", props.serverURL, props.ventureId, props.deployment.id],
        queryFn: () => fetchVentureIndex(props),
        refetchInterval: (query) => (query.state.data?.hasMore ? 1000 : 30000),
    });

export const useVentureGovernance = (props: VentureMarketProps) => {
    const queryClient = useQueryClient();
    const queryKey = [
        "venture-proposals",
        props.deployment.chainId,
        props.deployment.daoAddress,
        props.account?.address,
        props.serverURL,
        props.ventureId,
    ];
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const index = await fetchVentureIndex(props);
            const proposals = await getVentureDaoClient(props.deployment).listProposals(
                props.account?.address,
                undefined,
                index.proposals,
            );
            return {
                items: proposals.items,
                hasMore: index.hasMore,
                settings: await getVentureDaoClient(props.deployment).settings(),
            };
        },
        refetchInterval: (query) => (query.state.data?.hasMore ? 1000 : 30000),
    });
    const mutation = useMutation({
        mutationFn: (request: ProposalRequest | ProposalValues) =>
            "proposal" in request ? submitProposalAction(props, request) : createVentureProposal(props, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => console.error(error),
    });
    return { query, mutation };
};
