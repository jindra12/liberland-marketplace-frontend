import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeploymentManifest } from "@liberland/marketplace-contracts";

import {
    SaveVentureContractsDocument,
    StartupUpdate_ContractDeployments_Chain_MutationInput,
    type SaveVentureContractsMutation,
    type SaveVentureContractsMutationVariables,
} from "../../generated/graphql";
import { gqlFetcher } from "../../gqlFetcher";
import { invalidateStartupQueries } from "../../startupUtils";
import type { VentureContractsProps } from "./types";
import { toSavedDeployment } from "./utils";

export const useVentureDeployment = (props: VentureContractsProps) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (variables: SaveVentureContractsMutationVariables) =>
            gqlFetcher<SaveVentureContractsMutation, SaveVentureContractsMutationVariables>(
                SaveVentureContractsDocument,
                variables,
                undefined,
                props.serverURL || props.venture.serverURL,
            )(),
    });
    return async (manifest: DeploymentManifest) => {
        const existing = (props.venture.contractDeployments || [])
            .filter(
                (deployment) =>
                    deployment.chainId !== manifest.chainId || deployment.tokenAddress !== manifest.token.address,
            )
            .map((deployment) => {
                const { __typename, ...fields } = deployment;
                return {
                    ...fields,
                    chain:
                        deployment.chain === "tron"
                            ? StartupUpdate_ContractDeployments_Chain_MutationInput.Tron
                            : StartupUpdate_ContractDeployments_Chain_MutationInput.Ethereum,
                };
            });
        const response = await mutation.mutateAsync({
            id: props.venture.id,
            data: { contractDeployments: [...existing, toSavedDeployment(manifest)] },
        });
        if (
            !response.updateStartup?.contractDeployments?.some(
                (deployment) =>
                    deployment.tokenAddress === manifest.token.address &&
                    deployment.daoAddress === manifest.dao.address,
            )
        ) {
            throw new Error("The backend did not confirm the saved contract addresses.");
        }
        await invalidateStartupQueries(queryClient);
    };
};
