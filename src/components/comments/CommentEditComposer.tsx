import * as React from "react";

import { CommentComposer } from "./CommentComposer";
import type { CommentEditPayload } from "./types";

type CommentEditComposerProps = {
    commentId: string;
    initialValue: string;
    placeholder: string;
    onCancel: () => void;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
};

export const CommentEditComposer: React.FunctionComponent<CommentEditComposerProps> = (props) => {
    const handleSubmit = async (text: string) => {
        await props.onEditAction({
            text,
            comId: props.commentId,
        });
        props.onCancel();
    };

    return (
        <CommentComposer
            initialValue={props.initialValue}
            placeholder={props.placeholder}
            submitLabel="Save"
            allowCancel
            cancelLabel="Cancel"
            onCancel={props.onCancel}
            onSubmit={handleSubmit}
        />
    );
};
