import * as React from "react";
import { MinusCircleFilled, UsergroupAddOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { IdentityTagItem, IdentityTagLink } from "./IdentityTagLink";

type IdentityAccessTagsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    showIcons?: boolean;
    hideWhenEmpty?: boolean;
    keyPrefix?: string;
};

export const IdentityAccessTags: React.FunctionComponent<IdentityAccessTagsProps> = ({
    allowedIdentities,
    disallowedIdentities,
    className,
    showIcons = true,
    hideWhenEmpty = false,
    keyPrefix,
}) => {
    const allowed = allowedIdentities || [];
    const disallowed = disallowedIdentities || [];

    if (hideWhenEmpty && !allowed.length && !disallowed.length) {
        return null;
    }

    const keyBase = keyPrefix ? `${keyPrefix}-` : "";

    return (
        <Space size={[8, 8]} wrap className={className}>
            {allowed.map((identity) => (
                <IdentityTagLink
                    key={`${keyBase}allowed-${identity.id}`}
                    identity={identity}
                    color="success"
                    icon={showIcons ? <UsergroupAddOutlined /> : undefined}
                />
            ))}
            {disallowed.map((identity) => (
                <IdentityTagLink
                    key={`${keyBase}disallowed-${identity.id}`}
                    identity={identity}
                    color="error"
                    icon={showIcons ? <MinusCircleFilled /> : undefined}
                />
            ))}
        </Space>
    );
};
