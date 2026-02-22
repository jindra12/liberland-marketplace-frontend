import React from "react";
import { useAuth } from "react-oidc-context";
import { AuthGuard } from "./AuthGuard";
import { EmailVerificationWarning } from "./publish/EmailVerificationWarning";
import { PublishContent } from "./publish/PublishContent";

const Publish: React.FunctionComponent = () => {
    const auth = useAuth();

    React.useEffect(() => {
        if (auth.isAuthenticated && !auth.user?.profile?.email_verified) {
            auth.signinSilent();
        }
    }, [auth.isAuthenticated]);

    return (
        <AuthGuard redirect>
            {!auth.user?.profile?.email_verified ? (
                <EmailVerificationWarning email={auth.user?.profile?.email as string} />
            ) : (
                <PublishContent />
            )}
        </AuthGuard>
    );
};

export default Publish;
