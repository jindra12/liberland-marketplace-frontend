import { image, COOP_SYNDICATION_URL } from "../fixtures/shared";
import { companies } from "./companies";
import { identities } from "./identities";
import { Job__Status, Job_EmploymentType, Job_SalaryRange_Currency, Job_Bounty_Currency } from "../../../../src/generated/graphql";
import type { Job } from "../../../../src/generated/graphql";

export const jobs: Job[] = [
    {
        id: "coop-job-dock-foreman",
        title: "Dock Foreman",
        description: "Coordinate cooperative freight and loading",
        serverURL: COOP_SYNDICATION_URL,
        _status: Job__Status.Published,
        isSubscribed: true,
        positions: 1,
        salaryRange: { min: 3400, max: 4200, currency: Job_SalaryRange_Currency.Usd },
        employmentType: Job_EmploymentType.FullTime,
        applyUrl: "https://helix.example/apply/dock-foreman",
        bounty: { amount: 1600, currency: Job_Bounty_Currency.Usd },
        company: companies[0],
        createdBy: identities[0].createdBy,
        allowedIdentities: [identities[0], identities[2]],
        disallowedIdentities: [identities[1]],
        image: image("coop-job-dock-foreman", "Dock Foreman"),
    },
    {
        id: "coop-job-product-steward",
        title: "Product Steward",
        description: "Shape the cooperative product line",
        serverURL: COOP_SYNDICATION_URL,
        _status: Job__Status.Published,
        isSubscribed: false,
        positions: 2,
        salaryRange: { min: 4700, max: 5400, currency: Job_SalaryRange_Currency.Usd },
        employmentType: Job_EmploymentType.Contract,
        applyUrl: "https://salt.example/apply/product-steward",
        bounty: { amount: 1900, currency: Job_Bounty_Currency.Usd },
        company: companies[1],
        createdBy: identities[1].createdBy,
        allowedIdentities: [identities[1]],
        disallowedIdentities: [identities[0]],
        image: image("coop-job-product-steward", "Product Steward"),
    },
];
