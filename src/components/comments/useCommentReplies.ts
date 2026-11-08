import { useState } from "react";
import { ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../constants";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListCommentRepliesQuery } from "../hooks";
import type { CommentRepliesListProps } from "./types";

export const useCommentReplies = (props: CommentRepliesListProps) => {
    const [page, setPage] = useState(1);
    const query = useListCommentRepliesQuery({
        parentCommentId: props.parentCommentId,
        limit: ENTITY_COMMENTS_DEFAULT_LIMIT,
        page,
        url: props.serverURL,
    });
    const replies = useAccumulatedDocs(query.data?.Comments?.docs, page);
    return { query, replies, loadMore: () => setPage(page + 1) };
};
