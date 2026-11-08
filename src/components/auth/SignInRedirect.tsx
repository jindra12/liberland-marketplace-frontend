import * as React from "react";

import type { AuthContextProps } from "react-oidc-context";

import { Spin } from "antd";

interface SignInRedirectProps {
    returnTo: string;
    signinRedirect: AuthContextProps["signinRedirect"];
}

export const SignInRedirect: React.FunctionComponent<SignInRedirectProps> = (props) => {
    const started = React.useRef(false);
    React.useEffect(() => {
        if (!started.current) {
            started.current = true;
            props.signinRedirect({ state: props.returnTo });
        }
    }, [props]);
    return <Spin />;
};
