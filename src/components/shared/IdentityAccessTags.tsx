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
export const IdentityAccessTags: React.FunctionComponent<IdentityAccessTagsProps> = (props) => {
    const showIcons = props.showIcons === undefined ? true : props.showIcons;
    const hideWhenEmpty = props.hideWhenEmpty === undefined ? false : props.hideWhenEmpty;
    const allowed = props.allowedIdentities || [];
    const disallowed = props.disallowedIdentities || [];
    if (hideWhenEmpty && !allowed.length && !disallowed.length) {
        return null;
    }
    const keyBase = props.keyPrefix ? `${props.keyPrefix}-` : "";
    return (
        <Space size={[8, 8]} wrap className={props.className}>
            {allowed.map((identity) => (
                <IdentityTagLink key={`${keyBase}allowed-${identity.id}`} identity={identity} color="success" icon={showIcons ? <UsergroupAddOutlined /> : undefined} />
            ))}
            {disallowed.map((identity) => (
                <IdentityTagLink key={`${keyBase}disallowed-${identity.id}`} identity={identity} color="error" icon={showIcons ? <MinusCircleFilled /> : undefined} />
            ))}
        </Space>
    );
};
