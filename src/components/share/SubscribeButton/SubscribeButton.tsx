import * as React from "react";
import { useAuth } from "react-oidc-context";
import { SubscribeAnonButton } from "./SubscribeAnonButton";
import { SubscribeAuthButton } from "./SubscribeAuthButton";
import type { SubscribeButtonProps } from "./types";

export const SubscribeButton: React.FunctionComponent<SubscribeButtonProps> = (props) => {
    const auth = useAuth();
    const email = typeof auth.user?.profile?.email === "string" ? auth.user.profile.email : null;

    if (email) {
        return <SubscribeAuthButton {...props} email={email} />;
    }

    return <SubscribeAnonButton {...props} />;
};
