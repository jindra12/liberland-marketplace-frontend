import React from "react";
import { AuthGuard } from "./AuthGuard";
import { ProfileContent } from "./ProfileContent/ProfileContent";

const Profile: React.FunctionComponent = () => (
    <AuthGuard>
        <ProfileContent />
    </AuthGuard>
);

export default Profile;
