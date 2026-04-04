import type { StartupByIdQuery } from "../../../generated/graphql";

export type StartupDetailEntity = NonNullable<StartupByIdQuery["Startup"]>;

export type StartupDetailContentProps = {
    startup: StartupDetailEntity;
    startupId: string;
    serverURL?: string | null;
};

export type StartupDetailHeaderProps = {
    avatarSize: number;
    imageSrc?: string;
    startup: StartupDetailEntity;
};

export type StartupDetailResourcesSectionProps = {
    startup: StartupDetailEntity;
};

export type StartupDetailTabsProps = {
    startup: StartupDetailEntity;
    startupId: string;
    serverURL?: string | null;
};
