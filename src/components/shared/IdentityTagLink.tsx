import * as React from "react";

import { Link } from "react-router-dom";

import { Tag } from "antd";

export type IdentityTagItem = {
    id: string;
    name: string;
};
type IdentityTagLinkProps = {
    identity: IdentityTagItem;
    color?: React.ComponentProps<typeof Tag>["color"];
    icon?: React.ReactNode;
};
export const IdentityTagLink: React.FunctionComponent<IdentityTagLinkProps> = (props) => {
    return (
        <Link to={`/tribes/${props.identity.id}`} className="EntityDetail__identity">
            <Tag color={props.color} icon={props.icon}>
                {props.identity.name}
            </Tag>
        </Link>
    );
};
