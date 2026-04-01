import * as React from "react";
import { Button, Empty, Flex, Modal, Radio, Typography } from "antd";
import { AddressWithEmail } from "./types";
import objectHash from "object-hash";
import { buildBuyNowShippingAddressHeadline, buildBuyNowShippingAddressSummary } from "./utils";

type BuyNowAddressModalProps = {
    loading: boolean;
    onCancel: () => void;
    onSelect: (key: string) => void;
    open: boolean;
    options: AddressWithEmail[];
    selectedKey?: string;
};

export const BuyNowAddressModal: React.FunctionComponent<BuyNowAddressModalProps> = ({
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
            title="Choose a shipping address"
            onCancel={onCancel}
            footer={[
                <Button key="cancel" danger onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>,
            ]}
            className="BuyNowAddressModal"
        >
            {options.length === 0 ? (
                <Empty description="No saved shipping addresses found" />
            ) : (
                <Radio.Group
                    value={selectedKey}
                    onChange={(event) => {
                        onSelect(event.target.value);
                    }}
                    className="BuyNowAddressModal__group"
                >
                    <Flex vertical gap={12}>
                        {options.map((option) => {
                            const key = objectHash(option);
                            return (
                                <label
                                    key={key}
                                    className={[
                                        "BuyNowAddressModal__option",
                                        selectedKey === key ? "BuyNowAddressModal__option--selected" : "",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <Radio value={key} className="BuyNowAddressModal__radio" />
                                    <div className="BuyNowAddressModal__content">
                                        <Flex align="center" gap={8} wrap>
                                            <Typography.Text strong>{buildBuyNowShippingAddressHeadline(option)}</Typography.Text>
                                        </Flex>
                                        <Typography.Paragraph type="secondary" className="BuyNowAddressModal__summary">
                                            {buildBuyNowShippingAddressSummary(option)}
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
