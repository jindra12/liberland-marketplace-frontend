import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "react-oidc-context";
import { ProfileContent } from "./ProfileContent";

const Profile: React.FunctionComponent = () => {
    const auth = useAuth();

    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) return <Navigate to="/" replace />;

    return <ProfileContent />;
};

export default Profile;
