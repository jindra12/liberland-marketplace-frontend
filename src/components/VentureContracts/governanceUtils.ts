import { deploymentArtifacts } from "@liberland/marketplace-contracts/deployment/artifacts";
import { Interface, formatEther } from "ethers";

import type { GovernanceCall, VentureDeployment } from "./types";

const interfaces = {
    daoAddress: new Interface(deploymentArtifacts.daoArtifact.abi),
    tokenAddress: new Interface(deploymentArtifacts.tokenArtifact.abi),
    swapRouterAddress: new Interface(deploymentArtifacts.swapArtifact.abi),
    rewardTokenAddress: new Interface(deploymentArtifacts.rewardArtifact.abi),
    timelockAddress: new Interface(deploymentArtifacts.timelockArtifact.abi),
};

export const describeGovernanceCall = (
    deployment: VentureDeployment,
    target: string,
    value: bigint,
    data: string,
    depth = 0,
): GovernanceCall => {
    const base = { target, value: `${formatEther(value)} ETH`, data, nested: [] };
    const contract = Object.entries(interfaces).find(
        ([field]) => deployment[field as keyof typeof interfaces]?.toLowerCase() === target.toLowerCase(),
    );
    if (!contract || depth >= 4) {
        return { ...base, signature: "Unknown target or nested call", arguments: [], risky: true };
    }
    try {
        const decoded = contract[1].parseTransaction({ data, value });
        if (!decoded) {
            return { ...base, signature: "Unknown function", arguments: [], risky: true };
        }
        const nested = () => {
            switch (decoded.name) {
                case "relay":
                case "schedule":
                case "execute":
                    return [
                        describeGovernanceCall(
                            deployment,
                            decoded.args[0],
                            decoded.args[1],
                            decoded.args[2],
                            depth + 1,
                        ),
                    ];
                case "scheduleBatch":
                case "executeBatch":
                    return (decoded.args[0] as string[]).map((nestedTarget, index) =>
                        describeGovernanceCall(
                            deployment,
                            nestedTarget,
                            decoded.args[1][index],
                            decoded.args[2][index],
                            depth + 1,
                        ),
                    );
                default:
                    return [];
            }
        };
        return {
            ...base,
            signature: decoded.signature,
            arguments: decoded.fragment.inputs.map(
                (input, index) => `${input.name || index} (${input.type}): ${String(decoded.args[index])}`,
            ),
            risky: [
                "relay",
                "schedule",
                "execute",
                "scheduleBatch",
                "executeBatch",
                "upgradeToAndCall",
                "setTrustedForwarder",
                "setUpgradesEnabled",
                "freezeUpgrades",
                "setGovernance",
                "initialize",
            ].includes(decoded.name),
            nested: nested(),
        };
    } catch {
        // Unknown/malformed proposal bytes are untrusted input, not a rendering failure.
        return { ...base, signature: "Undecodable calldata", arguments: [], risky: true };
    }
};
