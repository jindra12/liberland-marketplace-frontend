import * as React from "react";

import { Typography } from "antd";

type EntitySubListSectionProps = {
    title: string;
    children: React.ReactNode;
};
export const EntitySubListSection: React.FunctionComponent<EntitySubListSectionProps> = (props) => {
    return (
        <div className="EntitySubList">
            <Typography.Title level={4} className="EntitySubList__title">
                {props.title}
            </Typography.Title>
            {props.children}
        </div>
    );
};
