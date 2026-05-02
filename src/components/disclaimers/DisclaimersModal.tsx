import * as React from "react";

import { Menu, Modal, Typography, Flex } from "antd";

import { Markdown } from "../Markdown";

import { disclaimerDefinitions, disclaimerMenuItems } from "./constants";
import { useDisclaimers } from "./context";
import { getDisclaimerDefinition } from "./utils";

export const DisclaimersModal: React.FunctionComponent = () => {
    const { isOpen, selectedDisclaimerKey, closeDisclaimers, selectDisclaimer } = useDisclaimers();
    const selectedDisclaimer = getDisclaimerDefinition(selectedDisclaimerKey);

    return (
        <Modal
            className="DisclaimersModal"
            open={isOpen}
            onCancel={closeDisclaimers}
            footer={null}
            width={1080}
            centered
            destroyOnHidden={false}
            title="Disclaimers"
        >
            <Flex className="DisclaimersModal__layout" gap={20} align="stretch">
                <Flex vertical gap={12} className="DisclaimersModal__menuPane">
                    <Typography.Text className="DisclaimersModal__menuIntro">
                        Pick a document to read.
                    </Typography.Text>
                    <Menu
                        className="DisclaimersModal__menu"
                        mode="inline"
                        items={disclaimerMenuItems}
                        selectedKeys={[selectedDisclaimerKey]}
                        onClick={({ key }) => {
                            const nextDisclaimer = disclaimerDefinitions.find((definition) => definition.key === key);
                            if (nextDisclaimer) {
                                selectDisclaimer(nextDisclaimer.key);
                            }
                        }}
                    />
                </Flex>
                <Flex vertical gap={12} className="DisclaimersModal__contentPane">
                    <Typography.Title level={3} className="DisclaimersModal__title">
                        {selectedDisclaimer.title}
                    </Typography.Title>
                    <Markdown className="DisclaimersModal__markdown">
                        {selectedDisclaimer.markdown}
                    </Markdown>
                </Flex>
            </Flex>
        </Modal>
    );
};
