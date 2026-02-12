import * as React from "react";
import { Button } from "antd";

export interface ApplyButtonProps {
    url?: string | null;
}

export const ApplyButton: React.FunctionComponent<ApplyButtonProps> = ({ url }) => {
    if (!url) return null;
    const href = url.startsWith("http") ? url : `https://${url}`;
    return (
        <Button type="primary" size="large" style={{ minWidth: 120 }} href={href} target="_blank" rel="noopener noreferrer">
            Apply
        </Button>
    );
};
