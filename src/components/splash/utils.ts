import { getSourceQualifiedEntityKey } from "../query/utils";
import type { PostDoc } from "../shared/post/types";

export const getPopularPosts = (posts: PostDoc[]) =>
    [...posts].sort(
        (left, right) =>
            (right.likeCount ?? 0) - (left.likeCount ?? 0) ||
            getSourceQualifiedEntityKey(left).localeCompare(getSourceQualifiedEntityKey(right)),
    );

export const isMarketAccordionSectionEnabled = (
    query: {
        isLoading: boolean;
    },
    count: number,
    minimumCount = 1,
): boolean => query.isLoading || count >= minimumCount;
