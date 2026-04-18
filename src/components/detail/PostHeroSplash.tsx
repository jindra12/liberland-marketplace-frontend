import * as React from "react";

import { Flex, Image } from "antd";

import type { PostDoc } from "../shared/post/types";
import { getPostHeroImageUrl } from "../shared/post/utils";

export interface PostHeroSplashProps {
    post: PostDoc;
}

export const PostHeroSplash: React.FunctionComponent<PostHeroSplashProps> = (props) => {
    const imageSrc = getPostHeroImageUrl(props.post);

    if (!imageSrc) {
        return null;
    }

    return (
        <Flex vertical className="PostDetail__heroSplash">
            <Image
                preview={false}
                src={imageSrc}
                alt={props.post.title ?? "Post hero image"}
                width="100%"
                className="PostDetail__heroSplashImage"
            />
        </Flex>
    );
};
