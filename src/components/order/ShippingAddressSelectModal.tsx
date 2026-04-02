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
export const ShippingAddressSelectModal: React.FunctionComponent<ShippingAddressSelectModalProps> = (props) => {
    return (
        <Modal
            open={props.open}
            destroyOnHidden
            title="Choose a default shipping address"
            onCancel={props.onCancel}
            footer={[
                <Button key="cancel" danger onClick={props.onCancel} disabled={props.loading}>
                    Cancel
                </Button>,
            ]}
            className="ShippingAddressSelectModal"
        >
            {props.options.length === 0 ? (
                <Empty description="No default shipping addresses found" />
            ) : (
                <Radio.Group
                    value={props.selectedKey}
                    onChange={(event) => {
                        props.onSelect(event.target.value);
                    }}
                    className="ShippingAddressSelectModal__group"
                >
                    <Flex vertical gap={12}>
                        {props.options.map((option) => {
                            return (
                                <label
                                    key={option.id}
                                    className={["ShippingAddressSelectModal__option", props.selectedKey === option.id ? "ShippingAddressSelectModal__option--selected" : ""].filter(Boolean).join(" ")}
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
