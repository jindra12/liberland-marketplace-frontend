import React from "react";
import { Result } from "antd";
import { useAuth } from "react-oidc-context";

interface OwnerGuardProps {
    createdById?: string;
    children: React.ReactNode;
}

export const OwnerGuard: React.FunctionComponent<OwnerGuardProps> = ({ createdById, children }) => {
    const auth = useAuth();

    if (createdById && createdById !== auth.user?.profile?.sub) {
        return <Result status="403" title="Not authorized" subTitle="You can only edit your own listings." />;
    }

    return <>{children}</>;
};
