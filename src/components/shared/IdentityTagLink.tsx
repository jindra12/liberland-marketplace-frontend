import * as React from "react";

import { Link } from "react-router-dom";

import { Tag } from "antd";

import type { Identity } from "../../generated/graphql";
import { routes } from "../../routes";

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
        <Link to={routes.tribes.detail.getLink(props.identity as Identity)} className="EntityDetail__identity">
            <Tag color={props.color} icon={props.icon}>
                {props.identity.name}
            </Tag>
        </Link>
    );
};
