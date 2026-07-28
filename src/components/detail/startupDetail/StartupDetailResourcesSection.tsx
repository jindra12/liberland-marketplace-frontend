import * as React from "react";

import { Divider, Flex, Tag, Typography } from "antd";

import { formatResourceLabel } from "../../../startupUtils";

import type { StartupDetailResourcesSectionProps } from "./types";

export const StartupDetailResourcesSection: React.FunctionComponent<
    StartupDetailResourcesSectionProps
> = (props) => {
    if (!props.startup.lookingFor?.length && !props.startup.alreadyHave?.length) {
        return null;
    }

    return (
        <>
            <Divider className="StartupDetail__divider" />
            <div className="StartupDetail__section StartupDetail__section--resources StartupDetail__resourceGrid">
                {!!props.startup.lookingFor?.length && (
                    <div className="StartupDetail__resourceGroup">
                        <Typography.Text className="StartupDetail__resourceHeading">
                            Looking for
                        </Typography.Text>
                        <Flex gap={6} wrap className="StartupDetail__tags">
                            {props.startup.lookingFor.map((resource) => (
                                <Tag key={resource} color="orange">
                                    {formatResourceLabel(resource)}
                                </Tag>
                            ))}
                        </Flex>
                    </div>
                )}
                {!!props.startup.alreadyHave?.length && (
                    <div className="StartupDetail__resourceGroup">
                        <Typography.Text className="StartupDetail__resourceHeading">
                            Already have
                        </Typography.Text>
                        <Flex gap={6} wrap className="StartupDetail__tags">
                            {props.startup.alreadyHave.map((resource) => (
                                <Tag key={resource} color="cyan">
                                    {formatResourceLabel(resource)}
                                </Tag>
                            ))}
                        </Flex>
                    </div>
                )}
            </div>
        </>
    );
};
