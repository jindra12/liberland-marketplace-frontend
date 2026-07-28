import { image, MAIN_SYNDICATION_URL } from "./shared";
import { companies } from "./companies";
import { meUser } from "./meUser";
import { Startup_AlreadyHave, Startup_FundsNeeded_Currency, Startup_LookingFor, Startup_Stage, Startup__Status } from "../../../../src/generated/graphql";
import type { Startup } from "../../../../src/generated/graphql";

export const startups: Startup[] = [
    {
        id: "startup-sky-relay",
        title: "Sky Relay",
        description: "Relay beacons for the marketplace",
        serverURL: MAIN_SYNDICATION_URL,
        _status: Startup__Status.Published,
        isSubscribed: true,
        stage: Startup_Stage.Mvp,
        lookingFor: [Startup_LookingFor.Founders],
        alreadyHave: [Startup_AlreadyHave.Product, Startup_AlreadyHave.Distribution],
        fundsNeeded: { amount: 45000, currency: Startup_FundsNeeded_Currency.Usd },
        company: companies[0],
        createdBy: meUser.user!,
        involvedUsers: [meUser.user!, meUser.user!],
        image: image("startup-sky-relay", "Sky Relay"),
    },
    {
        id: "startup-tide-loop",
        title: "Tide Loop",
        description: "Supply chain dashboard",
        serverURL: MAIN_SYNDICATION_URL,
        _status: Startup__Status.Published,
        isSubscribed: false,
        stage: Startup_Stage.Early,
        lookingFor: [Startup_LookingFor.Distribution],
        alreadyHave: [Startup_AlreadyHave.Team, Startup_AlreadyHave.Product],
        fundsNeeded: { amount: 12000, currency: Startup_FundsNeeded_Currency.Usd },
        company: companies[1],
        createdBy: meUser.user!,
        involvedUsers: [meUser.user!, meUser.user!],
        image: image("startup-tide-loop", "Tide Loop"),
    },
    {
        id: "startup-nomad-nest",
        title: "Nomad Nest",
        description: "Open membership community infra",
        serverURL: MAIN_SYNDICATION_URL,
        _status: Startup__Status.Published,
        isSubscribed: true,
        stage: Startup_Stage.Idea,
        lookingFor: [Startup_LookingFor.Production],
        alreadyHave: [Startup_AlreadyHave.Idea, Startup_AlreadyHave.Founders],
        fundsNeeded: { amount: 8400, currency: Startup_FundsNeeded_Currency.Usd },
        company: companies[3],
        createdBy: meUser.user!,
        involvedUsers: [meUser.user!, meUser.user!],
        image: image("startup-nomad-nest", "Nomad Nest"),
    },
];
