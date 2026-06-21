import * as React from "react";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { EndpointAuthAction } from "../../EndpointAuthAction/EndpointAuthAction";

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
    const [isLiked, setIsLiked] = React.useState(Boolean(props.liked));
    const [likeCount, setLikeCount] = React.useState(props.likeCount);
    const isPending = props.likeMutation.isPending || props.dislikeMutation.isPending;
    const buttonClassName = getLikeButtonClassName(props.className, isLiked, isPending);
    const icon = isLiked ? (
        <HeartFilled className="LikeButton__heart LikeButton__heart--filled" />
    ) : (
        <HeartOutlined className="LikeButton__heart LikeButton__heart--outlined" />
    );

    return (
        <EndpointAuthAction
            defaultAuthUrl={props.serverURL ? props.serverURL : undefined}
            requireVerifiedEmail
        >
            {({ runWithAuthOrLogin }) => (
                <Button
                    htmlType="button"
                    type="text"
                    className={buttonClassName}
                    aria-label={props["aria-label"] ?? (isLiked ? "Unlike" : "Like")}
                    aria-pressed={isLiked}
                    disabled={isPending}
                    onClick={async (event) => {
                        event.preventDefault();
                        await runWithAuthOrLogin(async () => {
                            if (isLiked) {
                                setIsLiked(false);
                                setLikeCount((currentLikeCount) => Math.max(0, currentLikeCount - 1));
                                props.dislikeMutation.mutate(getLikeButtonVariables(props.id, props.serverURL));
                                return;
                            }

                            setIsLiked(true);
                            setLikeCount((currentLikeCount) => currentLikeCount + 1);
                            props.likeMutation.mutate({
                                ...getLikeButtonVariables(props.id, props.serverURL),
                                liked: true,
                            });
                        });
                    }}
                >
                    <Flex align="center" gap={8}>
                        {icon}
                        <Typography.Text className="LikeButton__count">{getLikeCountText(likeCount)}</Typography.Text>
                    </Flex>
                </Button>
            )}
        </EndpointAuthAction>
    );
};
