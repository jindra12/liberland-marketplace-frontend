import * as React from "react";

import { GlobalOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

type PostRepostLinkProps = {
    repost?: string | null;
    className?: string;
};

export const PostRepostLink: React.FunctionComponent<PostRepostLinkProps> = (props) => {
    if (!props.repost) {
        return null;
    }

    return (
        <Typography.Link
            href={props.repost}
            target="_blank"
            rel="noreferrer"
            className={["PostRepostLink", props.className].filter(Boolean).join(" ")}
        >
            <Flex align="center" gap={6} className="PostRepostLink__content">
                <GlobalOutlined className="PostRepostLink__icon" />
                <span>Original post</span>
            </Flex>
        </Typography.Link>
    );
};
