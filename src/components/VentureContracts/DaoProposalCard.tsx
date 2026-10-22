import * as React from "react";

import { Alert, Button, Card, Flex, Form, Input, Select, Statistic, Tag, Typography } from "antd";
import { formatUnits } from "ethers";

import { proposalStateLabels } from "./constants";
import type { DaoProposalCardProps } from "./types";

export const DaoProposalCard: React.FunctionComponent<DaoProposalCardProps> = (props) => (
    <Card
        title={
            <Tag color={props.proposal.state === 1 ? "green" : "blue"}>{proposalStateLabels[props.proposal.state]}</Tag>
        }
        className="VentureContracts__proposal"
    >
        <Flex vertical gap={16}>
            <Typography.Paragraph>{props.proposal.description}</Typography.Paragraph>
            <Typography.Text copyable className="VentureContracts__address">
                Proposal: {props.proposal.id}
            </Typography.Text>
            <Typography.Text copyable className="VentureContracts__address">
                Proposer: {props.proposal.proposer}
            </Typography.Text>
            <Flex gap={24} wrap>
                <Statistic title="For" value={formatUnits(props.proposal.for, props.decimals)} />
                <Statistic title="Against" value={formatUnits(props.proposal.against, props.decimals)} />
                <Statistic title="Abstain" value={formatUnits(props.proposal.abstain, props.decimals)} />
                <Statistic
                    title={props.proposal.quorumIsProjected ? "Projected quorum" : "Snapshot quorum"}
                    value={formatUnits(props.proposal.quorum, props.decimals)}
                />
            </Flex>
            <Typography.Text type="secondary">
                Voting starts: {new Date(Number(props.proposal.snapshot) * 1000).toLocaleString()}. Ends:{" "}
                {new Date(Number(props.proposal.deadline) * 1000).toLocaleString()}.
            </Typography.Text>
            <Typography.Text>
                Quorum counts for + abstain votes. Only delegated rooted tokens at the snapshot vote.
            </Typography.Text>
            {props.connected && props.proposal.canCancel && (
                <Button danger disabled={props.busy} loading={props.busy}
                    onClick={() => props.onAction({ proposal: props.proposal, action: "cancel" })}>
                    Cancel my pending proposal
                </Button>
            )}
            {props.proposal.state === 1 &&
                (props.proposal.hasVoted ? (
                    <Alert type="success" message="Your vote is already recorded" />
                ) : (
                    <Form
                        layout="vertical"
                        className="VentureContracts__form"
                        initialValues={{ support: 1, reason: "" }}
                        onFinish={(values: { support: number; reason: string }) =>
                            props.onAction({
                                proposal: props.proposal,
                                action: "vote",
                                support: values.support,
                                reason: values.reason,
                            })
                        }
                    >
                        <Typography.Text>
                            Your snapshot votes: {formatUnits(props.proposal.votingPower, props.decimals)}
                        </Typography.Text>
                        <Form.Item name="support" label="Your vote" rules={[{ required: true }]}>
                            <Select
                                options={[
                                    { value: 1, label: "For" },
                                    { value: 0, label: "Against" },
                                    { value: 2, label: "Abstain" },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item name="reason" label="Reason (optional)" rules={[{ max: 50000 }]}>
                            <Input.TextArea showCount autoSize={{ minRows: 2, maxRows: 6 }} />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            type="primary"
                            loading={props.busy}
                            disabled={!props.connected || props.proposal.votingPower === 0n || props.busy}
                        >
                            Cast vote
                        </Button>
                        {props.connected && props.proposal.votingPower === 0n && (
                            <Typography.Text>No voting power at this proposal's snapshot.</Typography.Text>
                        )}
                    </Form>
                ))}
            {props.proposal.state === 4 && (
                <Button
                    disabled={!props.connected || props.busy}
                    loading={props.busy}
                    onClick={() => props.onAction({ proposal: props.proposal, action: "queue" })}
                >
                    Queue in timelock
                </Button>
            )}
            {props.proposal.state === 5 && (
                <>
                    <Typography.Text>
                        Timelock ready: {new Date(Number(props.proposal.eta) * 1000).toLocaleString()}
                    </Typography.Text>
                    <Button
                        disabled={!props.connected || props.busy || props.proposal.timestamp < props.proposal.eta}
                        loading={props.busy}
                        onClick={() => props.onAction({ proposal: props.proposal, action: "execute" })}
                    >
                        Execute proposal
                    </Button>
                </>
            )}
            <Typography.Text type="secondary" className="VentureContracts__address">
                Targets: {props.proposal.targets.join(", ")}
            </Typography.Text>
            <Typography.Paragraph code copyable className="VentureContracts__address">
                Calldata: {props.proposal.calldatas.join(", ")}
            </Typography.Paragraph>
            {!props.connected && (
                <Typography.Text>Connect your wallet to vote or execute governance actions.</Typography.Text>
            )}
        </Flex>
    </Card>
);
