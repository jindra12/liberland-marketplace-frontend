import * as React from "react";

import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Button, Form, Input, Select, Space } from "antd";
import type { FormInstance, FormListFieldData } from "antd";

import { TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../../form/constants";
import { PROFILE_WALLET_CHAIN_OPTIONS } from "../constants";
import type {
    ProfileContactFormValues,
    ProfileWalletFormValue,
    ProfileWalletSelection,
    ProfileWalletSelectionTarget,
} from "../types";

import { ProfileWalletSelector } from "./ProfileWalletSelector";
import { buildProfileWalletDuplicateValidator } from "./utils";

type ProfileWalletRowProps = {
    canMoveDown: boolean;
    canMoveUp: boolean;
    disabled?: boolean;
    field: FormListFieldData;
    form: FormInstance<ProfileContactFormValues>;
    move: (from: number, to: number) => void;
    onSelectionClear: () => void;
    onSelectionStart: (name: number) => void;
    onWalletSelected: (name: number, wallet: ProfileWalletSelection) => void;
    remove: (index: number | number[]) => void;
    selectionTarget: ProfileWalletSelectionTarget;
};

export const ProfileWalletRow: React.FunctionComponent<ProfileWalletRowProps> = (props) => {
    return (
        <div className="Profile__walletRow">
            <Form.Item
                noStyle
                shouldUpdate={(previousValues, nextValues) => {
                    return previousValues.wallets?.[props.field.name] !== nextValues.wallets?.[props.field.name];
                }}
            >
                {() => {
                    const wallet = props.form.getFieldValue(["wallets", props.field.name]) as
                        | ProfileWalletFormValue
                        | undefined;
                    const isSelecting = props.selectionTarget?.name === props.field.name;

                    return (
                        <>
                            <Form.Item
                                label="Chain"
                                name={[props.field.name, "chain"]}
                                rules={[{ required: true, message: "Select a chain" }]}
                            >
                                <Select
                                    allowClear
                                    options={PROFILE_WALLET_CHAIN_OPTIONS.map((option) => ({ ...option }))}
                                    placeholder="Select chain"
                                    onChange={() => {
                                        props.form.setFieldValue(["wallets", props.field.name, "provider"], undefined);
                                        props.form.setFieldValue(["wallets", props.field.name, "address"], undefined);
                                        props.onSelectionClear();
                                    }}
                                />
                            </Form.Item>

                            <Form.Item className="Profile__walletCompactField" label="Wallet">
                                <Space.Compact block className="Profile__walletCompact">
                                    <Form.Item
                                        noStyle
                                        name={[props.field.name, "provider"]}
                                        rules={[{ required: true, message: "Select a wallet provider" }]}
                                    >
                                        <Input placeholder="Select a wallet" readOnly />
                                    </Form.Item>

                                    <ProfileWalletSelector
                                        chain={wallet?.chain}
                                        disabled={props.disabled}
                                        isSelecting={isSelecting}
                                        label="Select wallet"
                                        onSelectionStart={() => props.onSelectionStart(props.field.name)}
                                        onWalletSelected={(selection) =>
                                            props.onWalletSelected(props.field.name, selection)
                                        }
                                    />
                                </Space.Compact>
                            </Form.Item>

                            <Form.Item className="Profile__walletCompactField" label="Wallet address">
                                <Space.Compact block className="Profile__walletCompact">
                                    <Form.Item
                                        noStyle
                                        dependencies={["wallets"]}
                                        name={[props.field.name, "address"]}
                                        rules={[
                                            { required: true, message: "Wallet address is required" },
                                            buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                                            {
                                                validator: buildProfileWalletDuplicateValidator(
                                                    props.form,
                                                    props.field.name,
                                                ),
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Enter wallet address" />
                                    </Form.Item>

                                    <ProfileWalletSelector
                                        chain={wallet?.chain}
                                        disabled={props.disabled}
                                        isSelecting={isSelecting}
                                        label="Select account"
                                        onSelectionStart={() => props.onSelectionStart(props.field.name)}
                                        onWalletSelected={(selection) =>
                                            props.onWalletSelected(props.field.name, selection)
                                        }
                                    />
                                </Space.Compact>
                            </Form.Item>

                            <div className="Profile__walletRowActions">
                                <Space wrap>
                                    <Button
                                        disabled={props.disabled || !props.canMoveUp}
                                        icon={<ArrowUpOutlined />}
                                        onClick={() => {
                                            props.onSelectionClear();
                                            props.move(props.field.name, props.field.name - 1);
                                        }}
                                    >
                                        Move up
                                    </Button>
                                    <Button
                                        disabled={props.disabled || !props.canMoveDown}
                                        icon={<ArrowDownOutlined />}
                                        onClick={() => {
                                            props.onSelectionClear();
                                            props.move(props.field.name, props.field.name + 1);
                                        }}
                                    >
                                        Move down
                                    </Button>
                                    <Button
                                        danger
                                        disabled={props.disabled}
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            props.onSelectionClear();
                                            props.remove(props.field.name);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </Space>
                            </div>
                        </>
                    );
                }}
            </Form.Item>
        </div>
    );
};
