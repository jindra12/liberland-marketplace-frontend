import React from "react";
import { Spin } from "antd";
import { useAuth } from "react-oidc-context";
import { Like, type LikeProps } from "../../../src/components/shared/Like/Like";

export const LikeSecurityProbe: React.FunctionComponent<LikeProps> = (props) => {
    const auth = useAuth();
    if (auth.isLoading) {
        return <Spin />;
    }
    return <Like {...props} />;
};
