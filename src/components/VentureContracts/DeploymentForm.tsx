import * as React from "react";

import { RocketOutlined } from "@ant-design/icons";
import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { Alert, Button, Checkbox, Col, Form, Input, Row, Select } from "antd";
import { MaxUint256, parseUnits } from "ethers";

import type { DeploymentFormProps, DeploymentValues } from "./types";

export const DeploymentForm: React.FunctionComponent<DeploymentFormProps> = (props) => {
    const [form] = Form.useForm<DeploymentValues>();
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={props.onDeploy}
            disabled={props.busy}
            className="VentureContracts__form"
            initialValues={{
                tokenName: props.ventureName,
                tokenSymbol: "",
                initialSupply: "21000000",
                deploymentNetwork: "ethereum",
            }}
        >
            <Alert
                type="info"
                showIcon
                message="Your wallet deploys. The DAO governs."
                description="Deployments require several confirmed transactions and gas. Token supply goes to your wallet. Upgrades remain frozen until authorized by governance. Deploying does not initialize or fund a liquidity pool."
            />
            <Row gutter={16}>
                <Col xs={24} md={16}>
                    <Form.Item name="tokenName" label="Token name" rules={[{ required: true }, { max: 100 }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item name="tokenSymbol" label="Symbol" rules={[{ required: true }, { max: 100 }]}>
                        <Input placeholder="VENT" />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                name="initialSupply"
                label="Fixed supply"
                extra="18 decimals. No further supply can be minted."
                rules={[
                    { required: true },
                    { pattern: /^[1-9]\d{0,59}$/, message: "Enter a positive whole-token supply." },
                    {
                        validator: async (_rule, value: string) => {
                            if (/^[1-9]\d{0,59}$/.test(value) && parseUnits(value, 18) > MaxUint256) {
                                throw new Error("Supply exceeds the contract's maximum token balance.");
                            }
                        },
                    },
                ]}
            >
                <Input inputMode="numeric" />
            </Form.Item>
            <Form.Item name="deploymentNetwork" label="Network" rules={[{ required: true }]}>
                <Select
                    options={Object.entries(deploymentNetworks).map(([value, configuration]) => ({
                        value,
                        label: configuration.label,
                    }))}
                />
            </Form.Item>
            <Form.Item
                name="acknowledged"
                valuePropName="checked"
                rules={[
                    {
                        validator: async (_rule, checked: boolean) => {
                            if (!checked) {
                                throw new Error("Confirm the deployment and gas costs before continuing.");
                            }
                        },
                    },
                ]}
            >
                <Checkbox>I understand deployment is irreversible and costs real gas on mainnet.</Checkbox>
            </Form.Item>
            <Button htmlType="submit" type="primary" size="large" icon={<RocketOutlined />} loading={props.busy}>
                Deploy token & governance
            </Button>
        </Form>
    );
};
