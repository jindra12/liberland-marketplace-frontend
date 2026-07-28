import * as React from "react";

import { Button, Flex, Modal, Typography } from "antd";

type SyndicationNsfwModalProps = {
    open: boolean;
    enabledCount: number;
    onContinue: () => void;
    onDisableAll: () => void;
};

export const SyndicationNsfwModal: React.FunctionComponent<SyndicationNsfwModalProps> = (props) => {
    return (
        <Modal
            className="SyndicationNsfwModal"
            open={props.open}
            title="18+ content"
            footer={null}
            centered
            maskClosable={false}
            closable={false}
            destroyOnHidden={false}
            width={520}
        >
            <Flex vertical gap={16} className="SyndicationNsfwModal__content">
                <Typography.Paragraph className="SyndicationNsfwModal__copy">
                    This marketplace has {props.enabledCount} enabled NSFW syndication source
                    {props.enabledCount === 1 ? "" : "s"}. You must be 18+ to continue.
                </Typography.Paragraph>
                <Typography.Text type="secondary" className="SyndicationNsfwModal__note">
                    You can continue to the site, or disable all NSFW-marked servers first.
                </Typography.Text>
                <Flex gap={12} wrap className="SyndicationNsfwModal__actions">
                    <Button type="primary" onClick={props.onContinue}>
                        Continue to site
                    </Button>
                    <Button onClick={props.onDisableAll}>Disable NSFW servers</Button>
                </Flex>
            </Flex>
        </Modal>
    );
};
