import * as React from "react";

import { Divider, Flex, Tabs } from "antd";

import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { DetailShareSection } from "../share/DetailShareSection";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

import { DetailBackButton } from "./DetailBackButton";
import type { CommonDetailProps } from "./types";

export const CommonDetail: React.FunctionComponent<CommonDetailProps> = (props) => {
    const sections = props.sections || [];
    const hasSections = sections.length > 0;
    const hasMultipleSections = sections.length > 1;

    return (
        <AnimatedIn>
            <Flex
                flex={1}
                vertical
                gap={props.gap ?? 12}
                className={`EntityDetail${props.className ? ` ${props.className}` : ""}`}
            >
                <DetailPageTracker serverUrl={props.serverURL} />
                <DetailBackButton to={props.backTo} label={props.backLabel} />
                {props.header}
                {props.beforeShare}
                <Divider />
                <DetailShareSection
                    label={props.shareLabel}
                    title={props.shareTitle}
                    text={props.shareText}
                    serverURL={props.serverURL}
                    subscriptionTarget={props.subscriptionTarget}
                    reportPath={props.reportPath}
                />
                {hasSections && <Divider />}
                {hasMultipleSections ? (
                    <Tabs
                        className="EntityDetail__tabs"
                        defaultActiveKey={sections[0]?.key}
                        items={sections.map((section) => ({
                            key: section.key,
                            label: section.label ?? section.key,
                            children: section.children,
                        }))}
                    />
                ) : (
                    sections[0]?.children
                )}
            </Flex>
        </AnimatedIn>
    );
};
