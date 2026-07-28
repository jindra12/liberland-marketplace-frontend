import * as React from "react";

import { CommentComposerActions } from "./CommentComposerActions";
import type { CommentSubmitPayload } from "./types";

type CommentCreateComposerProps = {
    placeholder: string;
    serverURL?: string | null;
    submitLabel: string;
    onSubmitAction: (payload: CommentSubmitPayload) => Promise<void>;
};

export const CommentCreateComposer: React.FunctionComponent<CommentCreateComposerProps> = (props) => {
    return (
        <CommentComposerActions
            placeholder={props.placeholder}
            submitLabel={props.submitLabel}
            serverURL={props.serverURL}
            showCompanyField
            onSubmit={async (values) => {
                await props.onSubmitAction({
                    text: values.text,
                    company: values.company!,
                });
            }}
        />
    );
};
