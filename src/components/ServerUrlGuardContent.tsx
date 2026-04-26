import * as React from "react";

import { useNavigate } from "react-router-dom";

import { Checkbox, Modal, Space, Typography } from "antd";

import { routes } from "../routes";

import type { EndpointContextType } from "./EndpointContext";
import { enableOrInsertEndpoint } from "./endpoints/utils";

type ServerUrlGuardContentProps = React.PropsWithChildren<{
    isTrusted: boolean;
    isLoading: boolean;
    decodedServerURL: string;
    displayServerURL: string;
    setUrls: EndpointContextType["setUrls"];
}>;

export const ServerUrlGuardContent: React.FunctionComponent<ServerUrlGuardContentProps> = (props) => {
    const navigate = useNavigate();
    const [shouldEnableContent, setShouldEnableContent] = React.useState(false);
    const [shouldAddServer, setShouldAddServer] = React.useState(false);

    if (props.isTrusted || shouldEnableContent) {
        return <>{props.children}</>;
    }

    const handleTrust = () => {
        if (shouldAddServer && props.decodedServerURL) {
            props.setUrls((current) => enableOrInsertEndpoint(current, props.decodedServerURL));
        }

        setShouldEnableContent(true);
    };

    return (
        <Modal
            open
            title="Trust this server?"
            okText="Yes"
            cancelText="No"
            onOk={handleTrust}
            onCancel={() => navigate(routes.home.route)}
            maskClosable={false}
            closable={false}
            destroyOnHidden
        >
            <Space direction="vertical" size={16} className="ServerUrlGuard__content">
                <Typography.Paragraph className="ServerUrlGuard__copy">
                    You are about to load data from <Typography.Text code>{props.displayServerURL}</Typography.Text>.
                    Do you trust this server?
                </Typography.Paragraph>
                <Checkbox checked={shouldAddServer} onChange={(event) => setShouldAddServer(event.target.checked)}>
                    Enable content from this server
                </Checkbox>
                {props.isLoading && (
                    <Typography.Text type="secondary">
                        We are still checking whether this server is already trusted.
                    </Typography.Text>
                )}
            </Space>
        </Modal>
    );
};
