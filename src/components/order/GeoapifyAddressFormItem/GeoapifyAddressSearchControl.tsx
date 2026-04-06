import * as React from "react";

import { Alert, Button, Flex, Form, Typography } from "antd";

type GeoapifyAddressSearchControlProps = {
    label: string;
    required?: boolean;
    geoapifyApiKey: string;
    selectedAddressSummary: string;
    onOpenSearch: () => void;
};
export const GeoapifyAddressSearchControl: React.FunctionComponent<GeoapifyAddressSearchControlProps> = (props) => {
    return (
        <Form.Item
            label={props.label}
            required={props.required}
            className="Order__geoapifySearchItem"
        >
            {props.geoapifyApiKey ? (
                <Flex className="Order__geoapifySearchActions" gap={12} wrap>
                    <Button onClick={props.onOpenSearch}>Search address</Button>
                    <Typography.Text
                        className="Order__geoapifySearchSummary"
                        type={props.selectedAddressSummary ? undefined : "secondary"}
                    >
                        {props.selectedAddressSummary ||
                            "No address selected yet. You can still enter it manually below."}
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
