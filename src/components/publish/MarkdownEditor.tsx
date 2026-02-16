import React, { useCallback, useRef, useState } from "react";
import { Button, Input, Segmented, Tooltip } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import {
    BoldOutlined,
    ItalicOutlined,
    LinkOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CodeOutlined,
    FontSizeOutlined,
} from "@ant-design/icons";
import { Markdown } from "../Markdown";

interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    rows?: number;
    placeholder?: string;
}

type Mode = "Write" | "Preview";

export const MarkdownEditor: React.FunctionComponent<MarkdownEditorProps> = ({
    value = "",
    onChange,
    rows = 6,
    placeholder,
}) => {
    const [mode, setMode] = useState<Mode>("Write");
    const textAreaRef = useRef<TextAreaRef>(null);

    const getTextArea = useCallback((): HTMLTextAreaElement | null => {
        return textAreaRef.current?.resizableTextArea?.textArea ?? null;
    }, []);

    const wrapSelection = useCallback(
        (prefix: string, suffix: string, defaultText: string) => {
            const el = getTextArea();
            if (!el) return;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const selected = value.substring(start, end);
            const text = selected || defaultText;
            const newValue =
                value.substring(0, start) + prefix + text + suffix + value.substring(end);
            onChange?.(newValue);

            const cursorPos = start + prefix.length + text.length;
            requestAnimationFrame(() => {
                el.focus();
                if (selected) {
                    el.setSelectionRange(cursorPos + suffix.length, cursorPos + suffix.length);
                } else {
                    el.setSelectionRange(start + prefix.length, cursorPos);
                }
            });
        },
        [value, onChange, getTextArea],
    );

    const prefixLine = useCallback(
        (prefix: string) => {
            const el = getTextArea();
            if (!el) return;
            const start = el.selectionStart;
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const newValue =
                value.substring(0, lineStart) + prefix + value.substring(lineStart);
            onChange?.(newValue);

            const cursorPos = start + prefix.length;
            requestAnimationFrame(() => {
                el.focus();
                el.setSelectionRange(cursorPos, cursorPos);
            });
        },
        [value, onChange, getTextArea],
    );

    const buttons = [
        { icon: <BoldOutlined />, tip: "Bold", action: () => wrapSelection("**", "**", "bold") },
        { icon: <ItalicOutlined />, tip: "Italic", action: () => wrapSelection("*", "*", "italic") },
        { icon: <FontSizeOutlined />, tip: "Heading", action: () => prefixLine("### ") },
        { icon: <LinkOutlined />, tip: "Link", action: () => wrapSelection("[", "](url)", "text") },
        { icon: <UnorderedListOutlined />, tip: "Bullet List", action: () => prefixLine("- ") },
        { icon: <OrderedListOutlined />, tip: "Numbered List", action: () => prefixLine("1. ") },
        { icon: <CodeOutlined />, tip: "Code Block", action: () => wrapSelection("```\n", "\n```", "code") },
    ];

    return (
        <div className="MarkdownEditor">
            <div className="MarkdownEditor__toolbar">
                <div className="MarkdownEditor__actions">
                    {buttons.map((btn) => (
                        <Tooltip key={btn.tip} title={btn.tip}>
                            <Button
                                type="text"
                                size="small"
                                icon={btn.icon}
                                htmlType="button"
                                onClick={btn.action}
                            />
                        </Tooltip>
                    ))}
                </div>
                <Segmented
                    size="small"
                    options={["Write", "Preview"]}
                    value={mode}
                    onChange={(val) => setMode(val as Mode)}
                />
            </div>
            {mode === "Write" ? (
                <Input.TextArea
                    ref={textAreaRef}
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                />
            ) : (
                <div className="MarkdownEditor__preview">
                    {value ? (
                        <Markdown>{value}</Markdown>
                    ) : (
                        <span style={{ color: "var(--ant-color-text-placeholder)" }}>
                            Nothing to preview
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
