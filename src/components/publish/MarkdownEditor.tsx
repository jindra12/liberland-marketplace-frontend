import * as React from "react";

import MDEditor from "@uiw/react-md-editor";

import { Typography } from "antd";

import { LONG_TEXT_INPUT_MAX_LENGTH } from "../form/constants";

interface MarkdownEditorProps extends Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "id" | "name" | "disabled" | "required" | "onBlur" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid" | "aria-required"> {
    value?: string;
    onChange?: (value: string) => void;
    rows?: number;
    placeholder?: string;
}
export const MarkdownEditor: React.FunctionComponent<MarkdownEditorProps> = (props) => {
    const value = props.value === undefined ? "" : props.value;
    const rows = props.rows === undefined ? 6 : props.rows;
    const remainingCharacters = LONG_TEXT_INPUT_MAX_LENGTH - value.length;
    return (
        <div className="MarkdownEditor" data-color-mode="dark">
            <MDEditor
                value={value}
                onChange={(val) => props.onChange?.(val ?? "")}
                height={rows * 28}
                preview="edit"
                textareaProps={{
                    id: props.id,
                    name: props.name,
                    disabled: props.disabled,
                    required: props.required,
                    onBlur: props.onBlur,
                    "aria-label": props["aria-label"],
                    "aria-labelledby": props["aria-labelledby"],
                    "aria-describedby": props["aria-describedby"],
                    "aria-invalid": props["aria-invalid"],
                    "aria-required": props["aria-required"],
                    placeholder: props.placeholder,
                }}
            />
            <Typography.Text type="secondary" aria-live="polite">
                {remainingCharacters > 0 ? remainingCharacters : 0} characters left
            </Typography.Text>
        </div>
    );
};
