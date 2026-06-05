import * as React from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import type { ButtonProps } from "antd";

import { useEndpointContext } from "../EndpointContext";

import { getDefaultEndpointUrls } from "./utils";

type ResetSyndicationUrlsButtonProps = {
    size?: ButtonProps["size"];
    className?: string;
};

export const ResetSyndicationUrlsButton: React.FunctionComponent<ResetSyndicationUrlsButtonProps> = (props) => {
    const { setAuthUrl, setUrls } = useEndpointContext();
    const [messageApi, messageContextHolder] = message.useMessage();
    const defaultUrls = getDefaultEndpointUrls();

    const handleReset = () => {
        setUrls(defaultUrls);
        setAuthUrl(defaultUrls[0].value);
        messageApi.open({
            type: "success",
            content: "Cached syndicated URLs reset to Main. Refreshing this page in 2 seconds.",
            duration: 2,
            onClose: () => {
                window.location.reload();
            },
        });
    };

    return (
        <>
            {messageContextHolder}
            <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleReset}
                size={props.size}
                className={props.className}
            >
                Reset cached URLs
            </Button>
        </>
    );
};
