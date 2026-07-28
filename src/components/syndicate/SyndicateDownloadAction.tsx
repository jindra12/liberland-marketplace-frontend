import * as React from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Button, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";

import { useEndpointContext } from "../EndpointContext";

import { getEnabledSyndicationDownloadTargets } from "./utils";

type SyndicateDownloadActionProps = {
    label: string;
};

export const SyndicateDownloadAction: React.FunctionComponent<SyndicateDownloadActionProps> = (props) => {
    const { urls } = useEndpointContext();
    const enabledTargets = React.useMemo(() => getEnabledSyndicationDownloadTargets(urls), [urls]);

    if (enabledTargets.length === 0) {
        return null;
    }

    if (enabledTargets.length === 1) {
        const target = enabledTargets[0];

        return (
            <Button
                type="primary"
                size="large"
                href={target.href}
                download="deploy-space.sh"
                icon={<DownloadOutlined />}
                className="SyndicateModal__downloadButton"
            >
                {props.label}
            </Button>
        );
    }

    const items: MenuProps["items"] = enabledTargets.map((target) => ({
        key: target.href,
        label: (
            <Typography.Link href={target.href} download="deploy-space.sh" className="SyndicateModal__downloadMenuLink">
                {target.label}
            </Typography.Link>
        ),
    }));

    return (
        <Dropdown.Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            menu={{ items }}
            href={enabledTargets[0].href}
            className="SyndicateModal__downloadDropdown"
            trigger={["click"]}
        >
            {props.label}
        </Dropdown.Button>
    );
};
