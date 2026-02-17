import * as React from "react";
import { Typography } from "antd";
import { EntitySubListSectionProps } from "../../types";

export const EntitySubListSection: React.FunctionComponent<EntitySubListSectionProps> = ({
    title,
    children,
}) => (
    <div className="EntitySubList">
        <Typography.Title level={4} className="EntitySubList__title">
            {title}
        </Typography.Title>
        {children}
    </div>
);
