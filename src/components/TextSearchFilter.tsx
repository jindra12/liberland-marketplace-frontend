import * as React from "react";
import { Input } from "antd";

export interface TextSearchFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export const TextSearchFilter: React.FunctionComponent<TextSearchFilterProps> = (props) => {
    return (
        <Input.Search
            placeholder="Search identities"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            allowClear
            className="FilterControl"
        />
    );
};
