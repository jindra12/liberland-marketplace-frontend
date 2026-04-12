import * as React from "react";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import type { DislikeMutation, LikeMutation } from "./types";
import { getLikeButtonClassName, getLikeButtonVariables, getLikeCountText } from "./utils";

export type LikeProps = {
    id: string;
    liked?: boolean | null;
    likeCount: number;
    serverURL?: string | null;
    likeMutation: LikeMutation;
    dislikeMutation: DislikeMutation;
    className?: string;
    "aria-label"?: string;
};

export const Like: React.FunctionComponent<LikeProps> = (props) => {
    const isLiked = props.liked === true;
    const isPending = props.likeMutation.isPending === true || props.dislikeMutation.isPending === true;
    const buttonClassName = getLikeButtonClassName(props.className, props.liked, isPending);
    const icon = isLiked ? (
        <HeartFilled className="LikeButton__heart LikeButton__heart--filled" />
    ) : (
        <HeartOutlined className="LikeButton__heart LikeButton__heart--outlined" />
    );

    const handleClick = () => {
        if (isLiked) {
            props.dislikeMutation.mutate(getLikeButtonVariables(props.id, props.serverURL));
            return;
        }

        props.likeMutation.mutate({
            ...getLikeButtonVariables(props.id, props.serverURL),
            liked: true,
        });
    };

    return (
        <Button
            htmlType="button"
            type="text"
            className={buttonClassName}
            aria-label={props["aria-label"] ?? (isLiked ? "Unlike" : "Like")}
            aria-pressed={isLiked}
            loading={isPending}
            onClick={handleClick}
        >
            <Flex align="center" gap={8}>
                {icon}
                <Typography.Text className="LikeButton__count">{getLikeCountText(props.likeCount)}</Typography.Text>
            </Flex>
        </Button>
    );
};
