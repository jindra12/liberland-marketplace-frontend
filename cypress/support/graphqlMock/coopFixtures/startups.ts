import { image, COOP_SYNDICATION_URL } from "../fixtures/shared";
import { companies } from "./companies";
import { identities } from "./identities";
import { Startup__Status, Startup_Stage, Startup_LookingFor, Startup_AlreadyHave, Startup_FundsNeeded_Currency } from "../../../../src/generated/graphql";
import type { Startup, User } from "../../../../src/generated/graphql";

const userFromIdentity = (id: string, name: string, email: string): User => ({
    id,
    name,
    email,
    emailVerified: true,
    shippingAddress: null,
    wallets: [],
});

const reefSignalUser = userFromIdentity("coop-user-reef-signal", "Reef Signal User", "reef-signal@example.test");
const saltBridgeUser = userFromIdentity("coop-user-salt-bridge", "Salt Bridge User", "salt-bridge@example.test");

export const startups: Startup[] = [
    {
        id: "coop-startup-reef-signal",
        title: "Reef Signal",
        description: "Signals for better shipment handoff",
        serverURL: COOP_SYNDICATION_URL,
        _status: Startup__Status.Published,
        isSubscribed: true,
        stage: Startup_Stage.Mvp,
        lookingFor: [Startup_LookingFor.Founders],
        alreadyHave: [Startup_AlreadyHave.Product],
        fundsNeeded: { amount: 30000, currency: Startup_FundsNeeded_Currency.Usd },
        company: companies[0],
        createdBy: identities[0].createdBy,
        involvedUsers: [reefSignalUser, saltBridgeUser],
        image: image("coop-startup-reef-signal", "Reef Signal"),
    },
    {
        id: "coop-startup-salt-bridge",
        title: "Salt Bridge",
        description: "Bridge software for the co-op",
        serverURL: COOP_SYNDICATION_URL,
        _status: Startup__Status.Published,
        isSubscribed: false,
        stage: Startup_Stage.Early,
        lookingFor: [Startup_LookingFor.Distribution],
        alreadyHave: [Startup_AlreadyHave.Team],
        fundsNeeded: { amount: 18000, currency: Startup_FundsNeeded_Currency.Usd },
        company: companies[1],
        createdBy: identities[1].createdBy,
        involvedUsers: [saltBridgeUser],
        image: image("coop-startup-salt-bridge", "Salt Bridge"),
    },
];
