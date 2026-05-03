import * as React from "react";

import { FileTextOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

import { ProfileInformationRequestModal } from "./ProfileInformationRequestModal";

type ProfileInformationRequestButtonProps = {
    messageApi: MessageInstance;
    selectedServerUrl: string;
};

export const ProfileInformationRequestButton: React.FunctionComponent<
    ProfileInformationRequestButtonProps
> = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <Button
                icon={<FileTextOutlined />}
                onClick={() => setIsOpen(true)}
                className="Profile__informationRequestButton"
            >
                Request information
            </Button>
            <ProfileInformationRequestModal
                open={isOpen}
                selectedServerUrl={props.selectedServerUrl}
                messageApi={props.messageApi}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
