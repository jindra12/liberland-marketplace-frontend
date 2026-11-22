import * as React from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Button, Flex, Popconfirm, Typography } from "antd";

import { clearLocalStorageAndGoHome } from "./storageReset/utils";

export const StorageResetPrompt: React.FunctionComponent = () => {
    return (
        <Flex vertical gap={12} align="start" className="StorageResetPrompt">
            <Typography.Paragraph className="StorageResetPrompt__text">
                As a last resort, reset this browser's saved marketplace settings. This removes saved servers and cart
                data.
            </Typography.Paragraph>
            <Popconfirm
                title="Reset saved browser settings?"
                description="Saved servers and carts on this device will be removed. This cannot be undone."
                okText="Reset settings"
                cancelText="Keep my settings"
                okButtonProps={{ danger: true }}
                onConfirm={clearLocalStorageAndGoHome}
            >
                <Button danger icon={<DeleteOutlined />}>
                    Reset browser settings
                </Button>
            </Popconfirm>
        </Flex>
    );
};
