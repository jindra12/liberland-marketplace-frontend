import * as React from "react";

import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    rows?: number;
    placeholder?: string;
}
export const MarkdownEditor: React.FunctionComponent<MarkdownEditorProps> = (props) => {
    const value = props.value === undefined ? "" : props.value;
    const rows = props.rows === undefined ? 6 : props.rows;
    return (
        <div data-color-mode="auto">
            <MDEditor
                value={value}
                onChange={(val) => props.onChange?.(val ?? "")}
                height={rows * 28}
                preview="edit"
                textareaProps={{
                    placeholder: props.placeholder,
                }}
            />
        </div>
    );
};
