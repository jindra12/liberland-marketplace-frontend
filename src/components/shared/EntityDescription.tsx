import * as React from "react";

import { UsergroupAddOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

import type { IdentityTagItem } from "../../types";
import { Markdown } from "../Markdown";

import { IdentityTagLink } from "./IdentityTagLink";

interface EntityDescriptionProps {
    description?: string | null;
    identity?: IdentityTagItem | null;
    serverURL?: string | null;
    variant?: "preview" | "detail";
}

export const EntityDescription: React.FunctionComponent<EntityDescriptionProps> = (props) => (
    <Flex vertical gap={8} className="EntityDescription">
        {props.description && (
            <Markdown className={props.variant === "detail" ? undefined : "Markdown--clamp3 EntityList__description"}>
                {props.description}
            </Markdown>
        )}
        {props.identity?.name && (
            <Flex align="center" wrap gap={8} className="EntityDescription__tribe">
                <Typography.Text type="secondary">Tribe:</Typography.Text>
                <IdentityTagLink
                    identity={props.identity}
                    serverURL={props.serverURL}
                    icon={<UsergroupAddOutlined />}
                    color="success"
                />
            </Flex>
        )}
    </Flex>
);
