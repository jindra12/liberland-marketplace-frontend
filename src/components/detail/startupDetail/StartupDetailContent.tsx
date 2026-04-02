import * as React from "react";

import { Divider, Flex, Grid } from "antd";

import { DetailPageTracker } from "../../analytics/DetailPageTracker";
import { Markdown } from "../../Markdown";
import { DetailShareSection } from "../../share/DetailShareSection";
import { DetailBackButton } from "../DetailBackButton";

import { StartupDetailHeader } from "./StartupDetailHeader";
import { StartupDetailResourcesSection } from "./StartupDetailResourcesSection";
import { StartupDetailTabs } from "./StartupDetailTabs";
import type { StartupDetailContentProps } from "./types";
import { getStartupDetailImage, getStartupShareText } from "./utils";

export const StartupDetailContent: React.FunctionComponent<StartupDetailContentProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const shareTitle = props.startup.title || "Venture";

    return (
        <Flex
            flex={1}
            vertical
            gap={md ? 18 : 16}
            className="EntityDetail StartupDetail"
        >
            <DetailPageTracker serverUrl={props.startup.serverURL || undefined} />
            <DetailBackButton to="/ventures" label="Back to ventures" />
            <StartupDetailHeader
                avatarSize={md ? 120 : 72}
                imageSrc={getStartupDetailImage(props.startup)}
                startup={props.startup}
                startupId={props.startupId}
            />

            <Divider className="StartupDetail__divider" />
            <div className="StartupDetail__section StartupDetail__section--description">
                <Markdown>{props.startup.description}</Markdown>
            </div>

            <StartupDetailResourcesSection startup={props.startup} />

            <Divider className="StartupDetail__divider" />
            <DetailShareSection
                label="Share this venture"
                title={shareTitle}
                text={getStartupShareText(props.startup)}
                subscriptionTarget={{
                    collection: "startups",
                    targetID: props.startup.id,
                    serverURL: props.startup.serverURL,
                    isSubscribed: props.startup.isSubscribed,
                }}
            />
            <Divider className="StartupDetail__divider" />
            <StartupDetailTabs startup={props.startup} startupId={props.startupId} />
        </Flex>
    );
};
