import * as React from "react";

import { Alert, Button, List, Space, Typography } from "antd";

import { useCheckoutHandoff } from "./checkout/useCheckoutHandoff";

export const McpCheckoutHydrator: React.FunctionComponent = () => {
    const handoff = useCheckoutHandoff();
    if (handoff.error) {
        return <Alert type="error" showIcon message={handoff.error} />;
    }
    if (handoff.accepted || !handoff.carts.length) {
        return null;
    }
    return (
        <Alert
            type="info"
            showIcon
            message="Review checkout servers"
            description={
                <Space direction="vertical">
                    <Typography.Text>
                        Only continue if you trust these servers. Their carts will replace saved carts on the same
                        servers; other carts are preserved. No payment is sent.
                    </Typography.Text>
                    <List
                        size="small"
                        dataSource={[...new Set(handoff.carts.map((cart) => cart.serverUrl))]}
                        renderItem={(url) => <List.Item>{url}</List.Item>}
                    />
                    <Button type="primary" onClick={handoff.accept}>
                        Use these carts
                    </Button>
                </Space>
            }
        />
    );
};
