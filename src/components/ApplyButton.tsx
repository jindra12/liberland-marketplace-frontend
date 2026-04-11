import * as React from "react";

import { Button } from "antd";

export interface ApplyButtonProps {
    url?: string | null;
    block?: boolean;
}
export const ApplyButton: React.FunctionComponent<ApplyButtonProps> = (props) => {
    if (!props.url) return null;
    const href = props.url.startsWith("http") ? props.url : `https://${props.url}`;
    return (
        <Button
            type="primary"
            size="large"
            className="ActionBtn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            block={props.block}
        >
            Apply
        </Button>
    );
};
