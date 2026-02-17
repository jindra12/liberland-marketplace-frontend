import React from "react";
import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    rows?: number;
    placeholder?: string;
}

export const MarkdownEditor: React.FunctionComponent<MarkdownEditorProps> = ({
    value = "",
    onChange,
    rows = 6,
    placeholder,
}) => (
    <div data-color-mode="auto">
        <MDEditor
            value={value}
            onChange={(val) => onChange?.(val ?? "")}
            height={rows * 28}
            preview="edit"
            textareaProps={{ placeholder }}
        />
    </div>
);
