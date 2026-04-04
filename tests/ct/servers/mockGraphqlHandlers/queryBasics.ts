import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "../types";
import { listPublished, toArray } from "./shared";
import { toCompany, toIdentity, toJob, toProduct, toStartup } from "./entities";

export const handleBasicQueries = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    if (operationName === "ListPublishedSyndicationUrls") {
        return {
            data: {
                Syndications: {
                    docs: toArray(state.syndications),
                },
            },
        };
    }

    if (operationName === "MeUser") {
        const user = state.activeUserId ? toArray(state.users).find((entry) => entry.id === state.activeUserId) : undefined;

        return {
            data: {
                meUser: {
                    user: user
                        ? {
                              id: user.id,
                              name: user.name ?? null,
                              email: user.email ?? null,
                              phone: user.phone ?? null,
                              shippingAddress: user.shippingAddress ?? null,
                              wallets: user.wallets ?? [],
                          }
                        : null,
                },
            },
        };
    }

    if (operationName === "CompanyById") {
        const company = toArray(state.companies).find((entry) => entry.id === variables.id);
        return {
            data: {
                Company: company ? toCompany(state, company) : null,
            },
        };
    }

    if (operationName === "JobById") {
        const job = toArray(state.jobs).find((entry) => entry.id === variables.id);
        return {
            data: {
                Job: job ? toJob(state, job) : null,
            },
        };
    }

    if (operationName === "StartupById") {
        const startup = toArray(state.startups).find((entry) => entry.id === variables.id);
        return {
            data: {
                Startup: startup ? toStartup(state, startup) : null,
            },
        };
    }

    if (operationName === "ProductById") {
        const product = toArray(state.products).find((entry) => entry.id === variables.id);
        return {
            data: {
                Product: product ? toProduct(state, product) : null,
            },
        };
    }

    if (operationName === "IdentityById") {
        const identity = toArray(state.identities).find((entry) => entry.id === variables.id);
        return {
            data: {
                Identity: identity ? toIdentity(state, identity) : null,
            },
        };
    }

    if (operationName === "EntityImageUrls") {
        return {
            data: {
                companies: {
                    docs: listPublished(state.companies, false)
                        .slice(0, 3)
                        .map((company) => ({
                            image: company.image ? { url: company.image.url } : null,
                        })),
                },
                jobs: {
                    docs: listPublished(state.jobs, false)
                        .slice(0, 3)
                        .map((job) => ({
                            image: job.image ? { url: job.image.url } : null,
                        })),
                },
                startups: {
                    docs: listPublished(state.startups, false)
                        .slice(0, 3)
                        .map((startup) => ({
                            image: startup.image ? { url: startup.image.url } : null,
                        })),
                },
                identities: {
                    docs: toArray(state.identities)
                        .slice(0, 3)
                        .map((identity) => ({
                            image: identity.image ? { url: identity.image.url } : null,
                        })),
                },
            },
        };
    }

    return null;
};
