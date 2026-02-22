import React from "react";
import { useAuth } from "react-oidc-context";
import { AuthGuard } from "./AuthGuard";
import { EmailVerificationWarning } from "./publish/EmailVerificationWarning";
import { PublishContent } from "./publish/PublishContent";

const Publish: React.FunctionComponent = () => {
    const auth = useAuth();
    const isAuthenticated = auth.isAuthenticated;
    const signinSilent = auth.signinSilent;
    const emailVerified = auth.user?.profile?.email_verified;

    React.useEffect(() => {
        if (isAuthenticated && !emailVerified) {
            signinSilent();
        }
    }, [isAuthenticated, signinSilent, emailVerified]);

    return (
        <AuthGuard redirect>
            {!emailVerified ? (
                <EmailVerificationWarning email={auth.user?.profile?.email as string} />
            ) : (
                <PublishContent />
            )}
        </AuthGuard>
    );
};

export default Publish;
