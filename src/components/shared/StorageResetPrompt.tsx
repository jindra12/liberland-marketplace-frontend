import * as React from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";

import { clearLocalStorageAndGoHome } from "./storageReset/utils";

export const StorageResetPrompt: React.FunctionComponent = () => {
    return (
        <Space direction="vertical" size={8} align="center" className="StorageResetPrompt">
            <Typography.Paragraph className="StorageResetPrompt__text">
                This clears your saved syndication settings and cart data. If stale browser state is causing the
                problem, it may fix the issue.
            </Typography.Paragraph>
            <Button danger icon={<DeleteOutlined />} onClick={clearLocalStorageAndGoHome}>
                Erase local storage and go home
            </Button>
        </Space>
    );
};
