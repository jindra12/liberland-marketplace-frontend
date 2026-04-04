import type { GraphqlOperationResult, GraphqlVariables, MockScenarioState } from "../types";
import { includesText, listPublished, sortByField, toArray, toPage } from "./shared";
import { toCompany, toIdentity, toJob, toProduct, toStartup } from "./entities";

export const handleSearchQueries = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    if (operationName === "SearchCompanies") {
        const docs = sortByField(
            listPublished(state.companies, false)
                .filter((company) => includesText(company.name, variables.searchTerm))
                .map((company) => ({
                    id: `search-companies-${company.id}`,
                    title: company.name,
                    priority: company.priority ?? 50,
                    doc: {
                        relationTo: "companies",
                        value: toCompany(state, company),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchJobs") {
        const docs = sortByField(
            listPublished(state.jobs, false)
                .filter((job) => includesText(job.title, variables.searchTerm))
                .map((job) => ({
                    id: `search-jobs-${job.id}`,
                    title: job.title,
                    priority: job.priority ?? 50,
                    doc: {
                        relationTo: "jobs",
                        value: toJob(state, job),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchStartups") {
        const docs = sortByField(
            listPublished(state.startups, false)
                .filter((startup) => includesText(startup.title, variables.searchTerm))
                .map((startup) => ({
                    id: `search-startups-${startup.id}`,
                    title: startup.title,
                    priority: startup.priority ?? 50,
                    doc: {
                        relationTo: "startups",
                        value: toStartup(state, startup),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchProducts") {
        const docs = sortByField(
            listPublished(state.products, false)
                .filter((product) => includesText(product.name, variables.searchTerm))
                .map((product) => ({
                    id: `search-products-${product.id}`,
                    title: product.name,
                    priority: product.priority ?? 50,
                    doc: {
                        relationTo: "products",
                        value: toProduct(state, product),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchIdentities") {
        const docs = sortByField(
            toArray(state.identities)
                .filter((identity) => includesText(identity.name, variables.searchTerm))
                .map((identity) => ({
                    id: `search-identities-${identity.id}`,
                    title: identity.name,
                    priority: identity.priority ?? 50,
                    doc: {
                        relationTo: "identities",
                        value: toIdentity(state, identity),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchCompaniesByIdentity") {
        const docs = sortByField(
            listPublished(state.companies, false)
                .filter((company) => company.identity === variables.identityId && includesText(company.name, variables.searchTerm))
                .map((company) => ({
                    id: `search-companies-identity-${company.id}`,
                    title: company.name,
                    priority: company.priority ?? 50,
                    doc: {
                        relationTo: "companies",
                        value: toCompany(state, company),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchCompaniesBySecondaryIdentity") {
        const docs = listPublished(state.companies, false)
            .filter((company) => {
                return (
                    company.allowedIdentities?.some((identityId) => identityId === variables.identityId) === true &&
                    includesText(company.name, variables.searchTerm)
                );
            })
            .map((company) => toCompany(state, company));
        return {
            data: {
                Companies: toPage(sortByField(docs, variables.sort), variables),
            },
        };
    }

    if (operationName === "SearchJobsByCompany") {
        const docs = sortByField(
            listPublished(state.jobs, false)
                .filter((job) => job.company === variables.companyId && includesText(job.title, variables.searchTerm))
                .map((job) => ({
                    id: `search-jobs-company-${job.id}`,
                    title: job.title,
                    priority: job.priority ?? 50,
                    doc: {
                        relationTo: "jobs",
                        value: toJob(state, job),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    if (operationName === "SearchJobsBySecondaryIdentity") {
        const companyIds = toArray(variables.companyIds).map((entry) => String(entry ?? "")).filter(Boolean);
        const docs = listPublished(state.jobs, false)
            .filter((job) => {
                return (
                    includesText(job.title, variables.searchTerm) &&
                    (job.allowedIdentities?.some((identityId) => identityId === variables.identityId) === true ||
                        companyIds.includes(job.company ?? ""))
                );
            })
            .map((job) => toJob(state, job));
        return {
            data: {
                Jobs: toPage(sortByField(docs, variables.sort), variables),
            },
        };
    }

    if (operationName === "SearchProductsByCompany") {
        const docs = sortByField(
            listPublished(state.products, false)
                .filter((product) => product.company === variables.companyId && includesText(product.name, variables.searchTerm))
                .map((product) => ({
                    id: `search-products-company-${product.id}`,
                    title: product.name,
                    priority: product.priority ?? 50,
                    doc: {
                        relationTo: "products",
                        value: toProduct(state, product),
                    },
                })),
            variables.sort ?? "-priority",
        );
        return {
            data: {
                Searches: toPage(docs, variables),
            },
        };
    }

    return null;
};
