import React from "react";
import { useAuth } from "react-oidc-context";
import { AuthGuard } from "../AuthGuard";
import { useEndpointContext } from "../EndpointContext";
import { EmailVerificationWarning } from "./EmailVerificationWarning";
import { PublishForms } from "./PublishForms";

export const PublishContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const emailVerified = auth.user?.profile?.email_verified;
    const { authUrl } = useEndpointContext();

    return <AuthGuard redirect>{!emailVerified ? <EmailVerificationWarning email={auth.user?.profile?.email as string} url={authUrl} /> : <PublishForms url={authUrl} />}</AuthGuard>;
};
