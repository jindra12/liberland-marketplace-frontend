import * as React from "react";
import { Button, Empty, Flex, Modal, Radio, Typography } from "antd";
import type { AddressWithEmail } from "./types";
import { buildShippingAddressHeadline, buildShippingAddressSummary } from "./utils";

type ShippingAddressSelectModalProps = {
    loading: boolean;
    onCancel: () => void;
    onSelect: (key: string) => void;
    open: boolean;
    options: AddressWithEmail[];
    selectedKey?: string;
};

export const ShippingAddressSelectModal: React.FunctionComponent<ShippingAddressSelectModalProps> = ({
    loading,
    onCancel,
    onSelect,
    open,
    options,
    selectedKey,
}) => {
    return (
        <Modal
            open={open}
            destroyOnHidden
            title="Choose a default shipping address"
            onCancel={onCancel}
            footer={[
                <Button key="cancel" danger onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>,
            ]}
            className="ShippingAddressSelectModal"
        >
            {options.length === 0 ? (
                <Empty description="No default shipping addresses found" />
            ) : (
                <Radio.Group
                    value={selectedKey}
                    onChange={(event) => {
                        onSelect(event.target.value);
                    }}
                    className="ShippingAddressSelectModal__group"
                >
                    <Flex vertical gap={12}>
                        {options.map((option) => {
                            return (
                                <label
                                    key={option.id}
                                    className={[
                                        "ShippingAddressSelectModal__option",
                                        selectedKey === option.id ? "ShippingAddressSelectModal__option--selected" : "",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <Radio value={option.id} className="ShippingAddressSelectModal__radio" />
                                    <div className="ShippingAddressSelectModal__content">
                                        <Flex align="center" gap={8} wrap>
                                            <Typography.Text strong>{buildShippingAddressHeadline(option)}</Typography.Text>
                                        </Flex>
                                        <Typography.Paragraph type="secondary" className="ShippingAddressSelectModal__summary">
                                            {buildShippingAddressSummary(option)}
                                        </Typography.Paragraph>
                                    </div>
                                </label>
                            );
                        })}
                    </Flex>
                </Radio.Group>
            )}
        </Modal>
    );
};
