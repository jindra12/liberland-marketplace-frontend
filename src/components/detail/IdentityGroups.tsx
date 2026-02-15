import * as React from "react";
import { Divider, Flex } from "antd";
import { MinusCircleFilled, UsergroupAddOutlined } from "@ant-design/icons";
import { IdentityTagItem, IdentityTagLink } from "../shared/IdentityTagLink";

type IdentityGroupsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    emptyText?: React.ReactNode;
};

export const IdentityGroups: React.FunctionComponent<IdentityGroupsProps> = ({
    allowedIdentities,
    disallowedIdentities,
    className,
    emptyText = "No identities found",
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
                            Allowed identities
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
                            Disallowed identities
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
