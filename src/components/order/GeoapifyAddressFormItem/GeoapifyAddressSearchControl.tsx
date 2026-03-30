import * as React from "react";
import { Alert, Button, Flex, Form, Typography } from "antd";

type GeoapifyAddressSearchControlProps = {
    label: string;
    required: boolean;
    geoapifyApiKey: string;
    selectedAddressSummary: string;
    onOpenSearch: () => void;
};

export const GeoapifyAddressSearchControl: React.FunctionComponent<GeoapifyAddressSearchControlProps> = ({
    label,
    required,
    geoapifyApiKey,
    selectedAddressSummary,
    onOpenSearch,
}) => {
    return (
        <Form.Item
            label={label}
            required={required}
            className="Order__geoapifySearchItem"
            extra={geoapifyApiKey
                ? "Use address search to fill the fields quickly, then adjust them below if needed."
                : "Geoapify key is missing. Enter the shipping address manually below."}
        >
            {geoapifyApiKey ? (
                <Flex className="Order__geoapifySearchActions" gap={12} wrap>
                    <Button onClick={onOpenSearch}>
                        Search address
                    </Button>
                    <Typography.Text
                        className="Order__geoapifySearchSummary"
                        type={selectedAddressSummary ? undefined : "secondary"}
                    >
                        {selectedAddressSummary || "No address selected yet. You can still enter it manually below."}
                    </Typography.Text>
                </Flex>
            ) : (
                <Alert
                    type="warning"
                    showIcon
                    message="Address autocomplete unavailable"
                    description="Set REACT_APP_GEOAPIFY_API_KEY to enable Geoapify suggestions."
                />
            )}
        </Form.Item>
    );
};
