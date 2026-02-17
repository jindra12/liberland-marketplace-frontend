import * as React from "react";
import { Divider, Flex } from "antd";
import { MinusCircleFilled, UsergroupAddOutlined } from "@ant-design/icons";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import {
    IDENTITY_GROUPS_ALLOWED_LABEL,
    IDENTITY_GROUPS_DEFAULT_EMPTY_TEXT,
    IDENTITY_GROUPS_DISALLOWED_LABEL,
} from "../../constants";
import { IdentityGroupsProps } from "../../types";

export const IdentityGroups: React.FunctionComponent<IdentityGroupsProps> = ({
    allowedIdentities,
    disallowedIdentities,
    className,
    emptyText = IDENTITY_GROUPS_DEFAULT_EMPTY_TEXT,
}) => {
    const allowed = allowedIdentities || [];
    const disallowed = disallowedIdentities || [];

    return (
        <Flex wrap gap="16px" justify="center" align="center" className={className}>
            {allowed.length ? (
                <Flex flex={5} vertical gap="16px">
                    <Flex vertical gap="8px">
                        <Flex gap="8px" align="center">
                            <UsergroupAddOutlined />
                            {IDENTITY_GROUPS_ALLOWED_LABEL}
                        </Flex>
                    </Flex>
                    {allowed.map((identity) => (
                        <IdentityTagLink key={`allowed-${identity.id}`} identity={identity} color="success" />
                    ))}
                </Flex>
            ) : undefined}
            {allowed.length && disallowed.length ? (
                <Divider type="vertical" />
            ) : undefined}
            {disallowed.length ? (
                <Flex flex={5} vertical gap="16px">
                    <Flex vertical gap="8px">
                        <Flex gap="8px" align="center">
                            <MinusCircleFilled />
                            {IDENTITY_GROUPS_DISALLOWED_LABEL}
                        </Flex>
                    </Flex>
                    {disallowed.length ? disallowed.map((identity) => (
                        <IdentityTagLink key={`disallowed-${identity.id}`} identity={identity} color="error" />
                    )) : emptyText}
                </Flex>
            ) : undefined}
        </Flex>
    );
};
