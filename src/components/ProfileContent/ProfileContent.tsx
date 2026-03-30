import * as React from "react";
import { Divider, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useMeUserQuery } from "../hooks";
import { LoginButton } from "../LoginButton";
import { useEndpointContext } from "../EndpointContext";
import { ProfileAccountServerCard } from "./ProfileAccountServerCard";
import { ProfileContactCard } from "./ProfileContactCard";
import { ProfileListingsSection } from "./ProfileListingsSection";
import { ProfileNicknameCard } from "./ProfileNicknameCard";
import { ProfilePasswordCard } from "./ProfilePasswordCard";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import {
    buildProfileServerOptions,
    findSelectedServerLabel,
} from "./utils";

export const ProfileContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { authUrl, urls } = useEndpointContext();
    const profile = auth.user?.profile;
    const userId = profile?.sub;
    const emailVerified = profile?.email_verified;

    const profileServerOptions = React.useMemo(() => buildProfileServerOptions(urls, authUrl), [authUrl, urls]);
    const [selectedServerUrl, setSelectedServerUrl] = React.useState(profileServerOptions[0]?.value || authUrl);
    const selectedServerLabel = React.useMemo(() => {
        return findSelectedServerLabel(profileServerOptions, selectedServerUrl);
    }, [profileServerOptions, selectedServerUrl]);
    const selectedServerUserQuery = useMeUserQuery(
        { url: selectedServerUrl },
        {
            enabled: !!selectedServerUrl,
            refetchOnMount: "always",
        },
    );
    const selectedServerUser = selectedServerUserQuery.data?.meUser?.user;

    React.useEffect(() => {
        if (!profileServerOptions.some(({ value }) => value === selectedServerUrl)) {
            setSelectedServerUrl(profileServerOptions[0]?.value || authUrl);
        }
    }, [authUrl, profileServerOptions, selectedServerUrl]);

    const refreshSelectedServerUser = React.useCallback(async () => {
        await selectedServerUserQuery.refetch();
    }, [selectedServerUserQuery]);

    return (
        <div className="Profile">
            <Typography.Title level={2}>My Profile</Typography.Title>

            <ProfileSummaryCard
                email={profile?.email}
                emailVerified={emailVerified}
                name={profile?.name}
                picture={profile?.picture}
            />

            <Divider />

            <div className="Profile__forms">
                <ProfileAccountServerCard
                    profileServerOptions={profileServerOptions}
                    selectedServerLabel={selectedServerLabel}
                    selectedServerUrl={selectedServerUrl}
                    onChangeServer={setSelectedServerUrl}
                />
                <ProfileNicknameCard
                    currentName={selectedServerUser?.name}
                    selectedServerUrl={selectedServerUrl}
                    selectedServerUserId={selectedServerUser?.id}
                    selectedServerUserLoading={selectedServerUserQuery.isFetching}
                    onUserUpdated={refreshSelectedServerUser}
                />
                <ProfilePasswordCard selectedServerUrl={selectedServerUrl} />
            </div>

            <Divider />

            <ProfileContactCard
                selectedServerUrl={selectedServerUrl}
                selectedServerUser={selectedServerUser}
                selectedServerUserLoading={selectedServerUserQuery.isFetching}
                onUserUpdated={refreshSelectedServerUser}
            />

            <Divider />

            <div className="Profile__actions">
                <LoginButton action="logout" danger onAfterAction={() => navigate("/")} />
            </div>

            <Divider />

            <ProfileListingsSection userId={userId} />
        </div>
    );
};
