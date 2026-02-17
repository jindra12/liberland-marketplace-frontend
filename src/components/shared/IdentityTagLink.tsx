import * as React from "react";
import { Link } from "react-router-dom";
import { Tag } from "antd";
import { IdentityTagLinkProps } from "../../types";

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
