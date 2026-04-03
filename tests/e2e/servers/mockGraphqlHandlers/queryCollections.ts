import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "../types";
import { listPublished, normalizeRelationId, normalizeRelationIds, toArray, toPage } from "./shared";
import { toCart } from "./commerce";
import { toCompany, toIdentity, toJob, toProduct, toStartup } from "./entities";

export const handleCollectionQueries = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    if (operationName === "ListCompanies") {
        return {
            data: {
                Companies: toPage(listPublished(state.companies, false).map((company) => toCompany(state, company)), variables),
            },
        };
    }

    if (operationName === "ListJobs") {
        return {
            data: {
                Jobs: toPage(listPublished(state.jobs, false).map((job) => toJob(state, job)), variables),
            },
        };
    }

    if (operationName === "ListStartups") {
        return {
            data: {
                Startups: toPage(listPublished(state.startups, false).map((startup) => toStartup(state, startup)), variables),
            },
        };
    }

    if (operationName === "ListProducts") {
        return {
            data: {
                Products: toPage(listPublished(state.products, false).map((product) => toProduct(state, product)), variables),
            },
        };
    }

    if (operationName === "ListIdentities") {
        return {
            data: {
                Identities: toPage(toArray(state.identities).map((identity) => toIdentity(state, identity)), variables),
            },
        };
    }

    if (operationName === "ListCompaniesByIdentity") {
        const identityId = normalizeRelationId(variables.identityId);
        const docs = listPublished(state.companies, false)
            .filter((company) => company.identity === identityId)
            .map((company) => toCompany(state, company));
        return {
            data: {
                Companies: toPage(docs, variables),
            },
        };
    }

    if (operationName === "ListCompaniesBySecondaryIdentity") {
        const identityId = normalizeRelationId(variables.identityId);
        const docs = listPublished(state.companies, false)
            .filter((company) => normalizeRelationIds(company.allowedIdentities).includes(identityId ?? ""))
            .map((company) => toCompany(state, company));
        return {
            data: {
                Companies: toPage(docs, variables),
            },
        };
    }

    if (operationName === "ListJobsByCompany") {
        const companyId = normalizeRelationId(variables.companyId);
        const docs = listPublished(state.jobs, false)
            .filter((job) => job.company === companyId)
            .map((job) => toJob(state, job));
        return {
            data: {
                Jobs: toPage(docs, variables),
            },
        };
    }

    if (operationName === "ListStartupsByCompany") {
        const companyId = normalizeRelationId(variables.companyId);
        const docs = listPublished(state.startups, false)
            .filter((startup) => startup.company === companyId)
            .map((startup) => toStartup(state, startup));
        return {
            data: {
                Startups: toPage(docs, variables),
            },
        };
    }

    if (operationName === "ListProductsByCompany") {
        const companyId = normalizeRelationId(variables.companyId);
        const docs = listPublished(state.products, false)
            .filter((product) => product.company === companyId)
            .map((product) => toProduct(state, product));
        return {
            data: {
                Products: toPage(docs, variables),
            },
        };
    }

    if (operationName === "ListStartupsByIdentity") {
        const identityId = normalizeRelationId(variables.identityId);
        const docs = listPublished(state.startups, false)
            .filter((startup) => startup.identity === identityId)
            .map((startup) => toStartup(state, startup));
        return {
            data: {
                Startups: toPage(docs, variables, true),
            },
        };
    }

    if (operationName === "ListJobsByIdentity") {
        const identityId = normalizeRelationId(variables.identityId);
        const docs = listPublished(state.jobs, false)
            .filter((job) => toArray(state.companies).find((company) => company.id === job.company)?.identity === identityId)
            .map((job) => toJob(state, job));
        return {
            data: {
                Jobs: toPage(docs, variables, true),
            },
        };
    }

    if (operationName === "ListProductsByIdentity") {
        const docs = listPublished(state.products, false)
            .filter((product) => toArray(state.companies).find((company) => company.id === product.company)?.identity === variables.identityId)
            .map((product) => toProduct(state, product));
        return {
            data: {
                Products: toPage(docs, variables, true),
            },
        };
    }

    if (operationName === "ListCompaniesByCreator") {
        const docs = toArray(state.companies)
            .filter((company) => !variables.userId || company.createdBy === variables.userId)
            .map((company) => toCompany(state, company));
        return {
            data: {
                Companies: {
                    docs,
                    totalDocs: docs.length,
                },
            },
        };
    }

    if (operationName === "ListJobsByCreator") {
        const docs = toArray(state.jobs)
            .filter((job) => !variables.userId || job.createdBy === variables.userId)
            .map((job) => toJob(state, job));
        return {
            data: {
                Jobs: {
                    docs,
                    totalDocs: docs.length,
                },
            },
        };
    }

    if (operationName === "ListStartupsByCreator") {
        const docs = toArray(state.startups)
            .filter((startup) => !variables.userId || startup.createdBy === variables.userId)
            .map((startup) => toStartup(state, startup));
        return {
            data: {
                Startups: {
                    docs,
                    totalDocs: docs.length,
                },
            },
        };
    }

    if (operationName === "ListProductsByCreator") {
        const companyIds = toArray(variables.companyIds).map((entry) => String(entry ?? "")).filter(Boolean);
        const docs = toArray(state.products)
            .filter((product) => companyIds.length === 0 || companyIds.includes(product.company ?? ""))
            .map((product) => toProduct(state, product));
        return {
            data: {
                Products: {
                    docs,
                    totalDocs: docs.length,
                },
            },
        };
    }

    if (operationName === "CartBySecret") {
        const secret = typeof variables.secret === "string" ? variables.secret : "";
        const docs = toArray(state.carts)
            .filter((cart) => cart.secret === secret)
            .map((cart) => toCart(state, cart));
        return {
            data: {
                Carts: toPage(docs, variables),
            },
        };
    }

    return null;
};
