import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export interface MarkdownProps {
    children?: string | null;
    className?: string;
}

export const Markdown: React.FunctionComponent<MarkdownProps> = (props) => {
    if (!props.children) {
        return null;
    }

    const classes = ["Markdown", props.className].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
                {props.children}
            </ReactMarkdown>
        </div>
    );
};
