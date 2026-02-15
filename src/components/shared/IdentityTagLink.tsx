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

export const IdentityTagLink: React.FunctionComponent<IdentityTagLinkProps> = ({
    identity,
    color,
    icon,
}) => (
    <Link to={`/identities/${identity.id}`}>
        <Tag color={color} icon={icon}>
            {identity.name}
        </Tag>
    </Link>
);
