import * as React from "react";

import { Alert, Button, Checkbox, Form, Input, Select } from "antd";
import { isAddress, isHexString, ZeroAddress } from "ethers";

import type { ProposalFormProps, ProposalValues } from "./types";

export const ProposalForm: React.FunctionComponent<ProposalFormProps> = (props) => {
    const [form] = Form.useForm<ProposalValues>();
    const kind = Form.useWatch("kind", form) || "reward";
    const upgrade = kind.includes("upgrade");
    return (
        <Form<ProposalValues>
            form={form}
            layout="vertical"
            initialValues={{ kind: "reward", amount: "0" }}
            onFinish={props.onSubmit}
            className="VentureContracts__form"
        >
            <Alert
                type="info"
                showIcon
                message="Propose a DAO change"
                description="Creating a proposal requires delegated rooted voting power. Voting and the timelock must complete before settings change."
            />
            <Form.Item name="kind" label="Proposal type" rules={[{ required: true }]}>
                <Select
                    onChange={() => form.setFieldValue("acknowledged", false)}
                    options={[
                        { value: "reward", label: "Monthly reward amount" },
                        { value: "fee", label: "Swap fee (%) and recipient" },
                        { value: "unroot", label: "Unroot an account's tokens" },
                        { value: "redemption", label: "Reward redemption rate" },
                        { value: "reserve", label: "Fund rewards from DAO treasury" },
                        { value: "prebind", label: "Allocate and root DAO-held tokens" },
                        { value: "enable-upgrades", label: "Enable contract upgrades" },
                        { value: "freeze-upgrades", label: "Permanently freeze contract upgrades" },
                        { value: "upgrade", label: "Upgrade contract implementation" },
                        { value: "voting-delay", label: "Voting delay (seconds)" },
                        { value: "voting-period", label: "Voting period (seconds)" },
                        { value: "proposal-threshold", label: "Proposal threshold (rooted tokens)" },
                        { value: "quorum", label: "Quorum (%)" },
                    ]}
                />
            </Form.Item>
            {!upgrade && (
                <Form.Item
                    name="amount"
                    label={["voting-delay", "voting-period"].includes(kind) ? "Duration (seconds)" : "Amount (tokens, or percent for swap fee / quorum)"}
                    dependencies={["kind"]}
                    rules={[
                        { required: true },
                        { max: 100 },
                        { pattern: /^\d+(\.\d+)?$/, message: "Enter a non-negative amount" },
                        ({ getFieldValue }) => ({
                            validator: async (_rule, value: string) => {
                                if (["voting-delay", "voting-period", "quorum"].includes(getFieldValue("kind")) && !/^\d+$/.test(value)) {
                                    throw new Error("Enter a whole number.");
                                }
                                if (getFieldValue("kind") === "quorum" && (Number(value) <= 0 || Number(value) > 100)) {
                                    throw new Error("Quorum must be greater than 0% and no more than 100%.");
                                }
                                if (getFieldValue("kind") === "voting-period" && Number(value) <= 0) {
                                    throw new Error("Voting period must be positive.");
                                }
                                if (
                                    getFieldValue("kind") === "fee" &&
                                    (Number(value) > 10 || (value.split(".")[1]?.length || 0) > 2)
                                ) {
                                    throw new Error("Fee must be 0-10% with at most two decimal places.");
                                }
                                if (
                                    ["unroot", "prebind", "reserve"].includes(getFieldValue("kind")) &&
                                    Number(value) <= 0
                                ) {
                                    throw new Error("Enter a positive token amount.");
                                }
                            },
                        }),
                    ]}
                >
                    <Input />
                </Form.Item>
            )}
            {["fee", "unroot", "prebind", "upgrade"].includes(kind) && (
                <Form.Item
                    name="address"
                    label={kind === "upgrade" ? "Implementation address" : "Recipient / account"}
                    dependencies={["kind"]}
                    rules={[
                        { max: 100 },
                        {
                            validator: async (_rule, value: string) => {
                                if (!isAddress(value || "") || value === ZeroAddress) {
                                    throw new Error("Enter a valid recipient or account address.");
                                }
                            },
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
            )}
            {upgrade && (
                <>
                    <Form.Item name="target" label="Governed contract" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "token", label: "Venture token" },
                                { value: "router", label: "Swap router" },
                                { value: "reward", label: "Reward token" },
                                { value: "dao", label: "DAO" },
                                { value: "timelock", label: "Timelock" },
                            ]}
                        />
                    </Form.Item>
                    {kind === "upgrade" && (
                        <Form.Item
                            name="initialization"
                            label="Upgrade initialization calldata (optional)"
                            rules={[
                                { max: 50000 },
                                {
                                    validator: async (_rule, value: string) => {
                                        if (value && !isHexString(value)) {
                                            throw new Error("Enter hexadecimal calldata.");
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input.TextArea showCount autoSize={{ minRows: 2, maxRows: 6 }} />
                        </Form.Item>
                    )}
                    <Alert
                        type="warning"
                        showIcon
                        message={
                            kind === "freeze-upgrades"
                                ? "Permanent freezes cannot be undone, even by the DAO."
                                : "An upgrade can change contract behavior. Verify the implementation and storage layout before voting."
                        }
                    />
                    <Form.Item
                        name="acknowledged"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: async (_rule, checked: boolean) => {
                                    if (!checked) {
                                        throw new Error("Confirm that you understand this governed operation.");
                                    }
                                },
                            },
                        ]}
                    >
                        <Checkbox>I understand the consequences of this contract change.</Checkbox>
                    </Form.Item>
                </>
            )}
            {["reserve", "prebind"].includes(kind) && (
                <Alert
                    type="info"
                    showIcon
                    message="The DAO must already hold enough liquid Venture tokens. Transfer tokens to its address before execution."
                />
            )}
            <Form.Item name="description" label="Proposal description" rules={[{ required: true }, { max: 50000 }]}>
                <Input.TextArea showCount autoSize={{ minRows: 3, maxRows: 10 }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={props.busy}>
                Submit proposal
            </Button>
        </Form>
    );
};
