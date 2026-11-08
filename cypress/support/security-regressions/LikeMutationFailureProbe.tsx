import React from "react";
import { Space, Typography } from "antd";
import { useDislikePostMutation, useLikePostMutation } from "../../../src/components/hooks";
import { LikeSecurityProbe } from "./LikeSecurityProbe";

interface LikeMutationFailureProbeProps {
    serverUrl: string;
    liked: boolean;
}

export const LikeMutationFailureProbe: React.FunctionComponent<LikeMutationFailureProbeProps> = (props) => {
    const like = useLikePostMutation({ retry: false });
    const dislike = useDislikePostMutation({ retry: false });

    return (
        <Space>
            <LikeSecurityProbe
                id="post"
                liked={props.liked}
                likeCount={4}
                serverURL={props.serverUrl}
                likeMutation={like}
                dislikeMutation={dislike}
            />
            <Typography.Text data-cy="like-request-state">
                {like.isError || dislike.isError ? "rejected" : "ready"}
            </Typography.Text>
        </Space>
    );
};
