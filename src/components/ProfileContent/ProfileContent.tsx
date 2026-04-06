import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { Divider, Flex, Typography } from "antd";

import { useEndpointContext } from "../EndpointContext";
import { useMeUserQuery } from "../hooks";
import { LoginButton } from "../LoginButton";

import { ProfileAccountServerCard } from "./ProfileAccountServerCard";
import { ProfileContactCard } from "./ProfileContactCard";
import { ProfileListingsSection } from "./ProfileListingsSection";
import { ProfileNicknameCard } from "./ProfileNicknameCard";
import { ProfilePasswordCard } from "./ProfilePasswordCard";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { buildProfileServerOptions, findSelectedServerLabel } from "./utils";

export const ProfileContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { authUrl, urls } = useEndpointContext();
    const profile = auth.user?.profile;
    const userId = profile?.sub;
    const emailVerified = profile?.email_verified;

    const profileServerOptions = React.useMemo(() => buildProfileServerOptions(urls, authUrl), [authUrl, urls]);
    const [selectedServerUrlState, setSelectedServerUrlState] = React.useState(
        profileServerOptions[0]?.value || authUrl,
    );
    const selectedServerUrl = profileServerOptions.some(({ value }) => value === selectedServerUrlState)
        ? selectedServerUrlState
        : profileServerOptions[0]?.value || authUrl;
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
    const selectedServerUser = selectedServerUserQuery.data?.[0]?.meUser?.user;

    const refreshSelectedServerUser = async () => {
        await selectedServerUserQuery.refetch();
    };

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

            <Flex vertical gap="16px">
                {profileServerOptions.length > 1 && (
                    <ProfileAccountServerCard
                        profileServerOptions={profileServerOptions}
                        selectedServerLabel={selectedServerLabel}
                        selectedServerUrl={selectedServerUrl}
                        onChangeServer={setSelectedServerUrlState}
                    />
                )}
                <ProfileNicknameCard
                    currentName={selectedServerUser?.name}
                    selectedServerUrl={selectedServerUrl}
                    selectedServerUserId={selectedServerUser?.id}
                    selectedServerUserLoading={selectedServerUserQuery.isFetching}
                    onUserUpdated={refreshSelectedServerUser}
                />
                <ProfilePasswordCard selectedServerUrl={selectedServerUrl} />
            </Flex>

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
