import React from "react";
import { Button, Input, Space, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useAuthServerStorage } from "../../../src/components/endpoints/useAuthServerStorage";
import { MAIN_SERVER_URL } from "../component-tests/constants";

export const AuthAuthorityProbe: React.FunctionComponent = () => {
    const auth = useAuth();
    const [selectedServer, setSelectedServer] = useAuthServerStorage(MAIN_SERVER_URL);
    return (
        <Space direction="vertical">
            <Input aria-label="Unsaved draft" defaultValue="" />
            <Typography.Text data-cy="auth-authority">{auth.settings.authority}</Typography.Text>
            <Typography.Text data-cy="auth-subject">{auth.user?.profile.sub || "Signed out"}</Typography.Text>
            <Typography.Text data-cy="selected-server">{selectedServer}</Typography.Text>
            <Button onClick={() => setSelectedServer(MAIN_SERVER_URL)}>Keep main server in this tab</Button>
            <Button onClick={() => auth.signinRedirect()}>Sign in to current server</Button>
        </Space>
    );
};
