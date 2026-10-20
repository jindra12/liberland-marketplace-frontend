import * as React from "react";

import { Alert, Button, Collapse, Empty, Flex, Skeleton, Typography } from "antd";
import { formatUnits } from "ethers";

import { DaoProposalCard } from "./DaoProposalCard";
import { ProposalForm } from "./ProposalForm";
import type { VentureMarketProps } from "./types";
import { useVentureGovernance } from "./useVentureMarket";

export const GovernancePanel: React.FunctionComponent<VentureMarketProps> = (props) => {
    const model = useVentureGovernance(props);
    return (
        <Flex vertical gap={16}>
            <Typography.Title level={4}>DAO proposals</Typography.Title>
            {model.query.data && (
                <Typography.Paragraph>
                    Voting delay: {String(model.query.data.settings.votingDelay)} seconds.
                    Voting period: {String(model.query.data.settings.votingPeriod)} seconds.
                    Proposal threshold: {formatUnits(
                        model.query.data.settings.proposalThreshold,
                        props.deployment.tokenDecimals ?? 18,
                    )} rooted tokens.
                    Quorum: {String(model.query.data.settings.quorumNumerator)} /
                    {String(model.query.data.settings.quorumDenominator)}.
                </Typography.Paragraph>
            )}
            {model.query.isPending && <Skeleton active />}
            {model.query.error && (
                <Alert
                    type="error"
                    message={model.query.error.message}
                    action={<Button onClick={() => model.query.refetch()}>Retry proposals</Button>}
                />
            )}
            {model.mutation.error && <Alert type="error" showIcon message={model.mutation.error.message} />}
            {model.mutation.data && (
                <Typography.Text copyable>Confirmed governance transaction: {model.mutation.data}</Typography.Text>
            )}
            {model.query.data?.items.map((proposal) => (
                <DaoProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    decimals={props.deployment.tokenDecimals ?? 18}
                    connected={Boolean(props.account && props.wallet)}
                    busy={model.mutation.isPending}
                    onAction={(request) => model.mutation.mutate(request)}
                />
            ))}
            {model.query.data && model.query.data.items.length === 0 && (
                <Empty description="No DAO proposals have been indexed yet." />
            )}
            {model.query.data?.hasMore && (
                <Alert
                    type="info"
                    message="The backend is indexing the remaining blocks. Results update automatically."
                />
            )}
            {props.account && props.wallet && (
                <Collapse
                    items={[
                        {
                            key: "create",
                            label: "Create a proposal",
                            children: (
                                <ProposalForm
                                    busy={model.mutation.isPending}
                                    onSubmit={(values) => model.mutation.mutate(values)}
                                />
                            ),
                        },
                    ]}
                />
            )}
        </Flex>
    );
};
