import * as React from "react";

import { CommentComposerActions } from "./CommentComposerActions";
import type { CommentComposerValues, CommentEditPayload } from "./types";

type CommentEditComposerProps = {
    commentId: string;
    initialValue: string;
    placeholder: string;
    onCancel: () => void;
    onEditAction: (payload: CommentEditPayload) => Promise<void>;
};

export const CommentEditComposer: React.FunctionComponent<CommentEditComposerProps> = (props) => {
    return (
        <CommentComposerActions
            placeholder={props.placeholder}
            submitLabel="Save"
            initialValue={props.initialValue}
            allowCancel
            cancelLabel="Cancel"
            onCancel={props.onCancel}
            onSubmit={async (values: CommentComposerValues) => {
                await props.onEditAction({
                    text: values.text,
                    comId: props.commentId,
                });
                props.onCancel();
            }}
        />
    );
};
