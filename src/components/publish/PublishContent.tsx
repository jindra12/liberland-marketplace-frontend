import * as React from "react";

import { useAuth } from "react-oidc-context";

import { AuthGuard } from "../AuthGuard";

import { EmailVerificationWarning } from "./EmailVerificationWarning";
import { PublishForms } from "./PublishForms";

export interface PublishContentProps {
    canCreateContent: boolean;
    url: string;
}

export const PublishContent: React.FunctionComponent<PublishContentProps> = (props) => {
    const auth = useAuth();
    const emailVerified = auth.user?.profile?.email_verified;

    return (
        <AuthGuard redirect>
            {!emailVerified ? (
                <EmailVerificationWarning email={auth.user?.profile?.email as string} url={props.url} />
            ) : (
                <PublishForms defaultCategory={props.canCreateContent ? undefined : "publish-post"} url={props.url} />
            )}
        </AuthGuard>
    );
};
