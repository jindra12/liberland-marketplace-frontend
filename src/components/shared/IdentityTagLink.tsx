import * as React from "react";

import { Link } from "react-router-dom";

import { Tag } from "antd";

import { routes } from "../../routes";
import type { IdentityTagItem } from "../../types";

type IdentityTagLinkProps = {
    identity: IdentityTagItem;
    serverURL?: string | null;
    color?: React.ComponentProps<typeof Tag>["color"];
    icon?: React.ReactNode;
};
export const IdentityTagLink: React.FunctionComponent<IdentityTagLinkProps> = (props) => {
    const serverURL = props.identity.serverURL || props.serverURL;
    const tag = (
        <Tag color={props.color} icon={props.icon}>
            {props.identity.name}
        </Tag>
    );
    if (!serverURL) {
        return tag;
    }

    return (
        <Link
            to={routes.tribes.detail.getLink({ id: props.identity.id, serverURL })}
            className="EntityDetail__identity"
        >
            {tag}
        </Link>
    );
};
