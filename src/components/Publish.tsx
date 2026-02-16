import React from "react";
import { Spin } from "antd";
import { useAuth } from "react-oidc-context";
import { EmailVerificationWarning } from "./publish/EmailVerificationWarning";
import { PublishContent } from "./publish/PublishContent";

const Publish: React.FunctionComponent = () => {
    const auth = useAuth();

    if (auth.isLoading) return <Spin />;

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return <Spin />;
    }

    if (!auth.user?.profile?.email_verified) {
        return <EmailVerificationWarning email={auth.user?.profile?.email as string} />;
    }

    return <PublishContent />;
};

export default Publish;
