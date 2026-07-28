import * as React from "react";

import { useLocation } from "react-router-dom";

import { buildLoginReturnTo } from "./auth/utils";
import { LoginButtonSelect } from "./LoginButtonSelect";

type LoginButtonProps = {
    className?: string;
};

export const LoginButton: React.FunctionComponent<LoginButtonProps> = (props) => {
    const location = useLocation();
    const returnTo = buildLoginReturnTo(location.pathname, location.search, location.hash);

    return (
        <LoginButtonSelect className={props.className} returnTo={returnTo} />
    );
};
