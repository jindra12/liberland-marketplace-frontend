import * as React from "react";

import { useAuth } from "react-oidc-context";

import { Divider, Flex, Typography, message } from "antd";

import { useEndpointContext } from "../EndpointContext";
import { useMeUserQuery } from "../hooks";
import { LoginButton } from "../LoginButton";

import { ProfileAccountServerCard } from "./ProfileAccountServerCard";
import { ProfileContactCard } from "./ProfileContactCard";
import { ProfileInformationRequestButton } from "./ProfileInformationRequestButton";
import { ProfileListingsSection } from "./ProfileListingsSection";
import { ProfileNicknameCard } from "./ProfileNicknameCard";
import { ProfilePasswordCard } from "./ProfilePasswordCard";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { buildProfileServerOptions, findSelectedServerLabel } from "./utils";

export const ProfileContent: React.FunctionComponent = () => {
    const auth = useAuth();
    const { authUrl, urls } = useEndpointContext();
    const profile = auth.user?.profile;
    const userId = profile?.sub;
    const emailVerified = profile?.email_verified;

    const profileServerOptions = React.useMemo(() => buildProfileServerOptions(urls, authUrl), [authUrl, urls]);
    const [messageApi, messageContextHolder] = message.useMessage();
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
            {messageContextHolder}
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
                    messageApi={messageApi}
                />
                <ProfilePasswordCard selectedServerUrl={selectedServerUrl} messageApi={messageApi} />
            </Flex>

            <Divider />

            <ProfileContactCard
                selectedServerUrl={selectedServerUrl}
                selectedServerUser={selectedServerUser}
                selectedServerUserLoading={selectedServerUserQuery.isFetching}
                onUserUpdated={refreshSelectedServerUser}
                messageApi={messageApi}
            />

            <Divider />

            <Flex className="Profile__actions" gap="small" wrap>
                <ProfileInformationRequestButton messageApi={messageApi} selectedServerUrl={selectedServerUrl} />
                <LoginButton />
            </Flex>

            <Divider />

            <ProfileListingsSection userId={userId} serverURL={selectedServerUrl} />
        </div>
    );
};
