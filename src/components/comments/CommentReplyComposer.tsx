import * as React from "react";

import { CommentComposerActions } from "./CommentComposerActions";
import type { CommentReplyPayload } from "./types";

type CommentReplyComposerProps = {
    commentId: string;
    serverURL?: string | null;
    placeholder: string;
    onCancel: () => void;
    onReplyAction: (payload: CommentReplyPayload) => Promise<void>;
};

export const CommentReplyComposer: React.FunctionComponent<CommentReplyComposerProps> = (props) => {
    return (
        <CommentComposerActions
            placeholder={props.placeholder}
            submitLabel="Reply"
            serverURL={props.serverURL}
            showCompanyField
            allowCancel
            cancelLabel="Cancel"
            onCancel={props.onCancel}
            onSubmit={async (values) => {
                await props.onReplyAction({
                    text: values.text,
                    company: values.company,
                    repliedToCommentId: props.commentId,
                });
                props.onCancel();
            }}
        />
    );
};
