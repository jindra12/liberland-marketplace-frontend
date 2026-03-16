import * as React from "react";
import { message } from "antd";

export const useCopyLink = () => {
    const [messageApi, messageContextHolder] = message.useMessage();

    const copyLink = React.useCallback(async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            messageApi.success("Link copied");
        } catch {
            messageApi.error("Could not copy link");
        }
    }, [messageApi]);

    return {
        copyLink,
        messageContextHolder,
    };
};
