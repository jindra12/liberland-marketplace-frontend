import * as React from "react";

import { Tag, Typography } from "antd";

type SyndicationNsfwTagProps = {
    showDescription?: boolean;
    className?: string;
};

export const SyndicationNsfwTag: React.FunctionComponent<SyndicationNsfwTagProps> = (props) => {
    return (
        <div className={props.className}>
            <Tag color="red">NSFW</Tag>
            {props.showDescription ? (
                <Typography.Text type="secondary">You must be 18+ to see this content.</Typography.Text>
            ) : null}
        </div>
    );
};
