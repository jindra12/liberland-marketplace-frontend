import * as React from "react";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button, Flex, message, Typography } from "antd";

import { EndpointAuthAction } from "../../EndpointAuthAction/EndpointAuthAction";

import type { DislikeMutation, LikeMutation, OptimisticLikeState } from "./types";
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
    const [optimistic, setOptimistic] = React.useState<OptimisticLikeState | null>(null);
    const matchesSnapshot = optimistic?.id === props.id && optimistic.serverURL === props.serverURL
        && optimistic.baselineLiked === Boolean(props.liked) && optimistic.baselineCount === props.likeCount;
    const isLiked = matchesSnapshot ? optimistic.liked : Boolean(props.liked);
    const likeCount = matchesSnapshot ? optimistic.count : props.likeCount;
    const isPending = props.likeMutation.isPending || props.dislikeMutation.isPending;
    const buttonClassName = getLikeButtonClassName(props.className, isLiked, isPending);
    const icon = isLiked ? (
        <HeartFilled className="LikeButton__heart LikeButton__heart--filled" />
    ) : (
        <HeartOutlined className="LikeButton__heart LikeButton__heart--outlined" />
    );

    return (
        <EndpointAuthAction defaultAuthUrl={props.serverURL} requireVerifiedEmail>
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
                            setOptimistic({
                                id: props.id,
                                serverURL: props.serverURL,
                                baselineLiked: Boolean(props.liked),
                                baselineCount: props.likeCount,
                                liked: !isLiked,
                                count: Math.max(0, likeCount + (isLiked ? -1 : 1)),
                            });
                            const options = {
                                onError: (error: unknown) => {
                                    console.error(error);
                                    setOptimistic(optimistic);
                                    message.error("Could not update your reaction. Please try again.");
                                },
                            };
                            if (isLiked) {
                                props.dislikeMutation.mutate(
                                    getLikeButtonVariables(props.id, props.serverURL), options,
                                );
                                return;
                            }

                            props.likeMutation.mutate({
                                ...getLikeButtonVariables(props.id, props.serverURL),
                                liked: true,
                            }, options);
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
