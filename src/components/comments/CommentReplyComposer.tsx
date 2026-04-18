import * as React from "react";

import { CommentComposer } from "./CommentComposer";
import type { CommentReplyPayload } from "./types";

type CommentReplyComposerProps = {
    commentId: string;
    placeholder: string;
    onCancel: () => void;
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
};

export const CommentReplyComposer: React.FunctionComponent<CommentReplyComposerProps> = (props) => {
    const handleSubmit = async (text: string) => {
        await props.onReplyAction({
            text,
            repliedToCommentId: props.commentId,
        });
        props.onCancel();
    };

    return (
        <CommentComposer
            placeholder={props.placeholder}
            submitLabel="Reply"
            allowCancel
            cancelLabel="Cancel"
            onCancel={props.onCancel}
            onSubmit={handleSubmit}
        />
    );
};
