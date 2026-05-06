import { encodeServerUrlSegment } from "../../../src/routes";

import type { DetailGoal, ListGoal, SearchGoal } from "./types";

export const MAIN_SERVER_URL = "http://127.0.0.1:3010";
export const COOP_SERVER_URL = "http://127.0.0.1:3011";
export const GUEST_SERVER_URL = "http://127.0.0.1:3012";

export const detailRoute = (baseRoute: string, id: string, serverUrl: string = MAIN_SERVER_URL): string =>
    `${baseRoute}/${id}/${encodeServerUrlSegment(serverUrl)}`;

export const editRoute = (baseRoute: string, id: string, serverUrl: string = MAIN_SERVER_URL): string =>
    `${baseRoute}/edit/${id}/${encodeServerUrlSegment(serverUrl)}`;

export const syndicationDetailRoute = (serverUrl: string): string =>
    `/syndication/${encodeURIComponent(serverUrl)}/${encodeServerUrlSegment(serverUrl)}`;

export const LIST_GOALS: ListGoal[] = [
    {
        trigger: "Posts",
        route: "/posts",
        title: "Posts",
        operationName: "ListPosts",
        responseKey: "Posts",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Harbor Operations Digest",
        minimumDocs: 1,
    },
    {
        trigger: "Jobs",
        route: "/jobs",
        title: "Jobs",
        operationName: "ListJobs",
        responseKey: "Jobs",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Dockmaster",
        minimumDocs: 0,
    },
    {
        trigger: "Market",
        route: "/products-services",
        title: "Products / Services",
        operationName: "ListProducts",
        responseKey: "Products",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Solar Widget",
        minimumDocs: 0,
    },
    {
        trigger: "Companies",
        route: "/companies",
        title: "Companies",
        operationName: "ListCompanies",
        responseKey: "Companies",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Harbor Labs",
        minimumDocs: 0,
    },
    {
        trigger: "Ventures",
        route: "/ventures",
        title: "Ventures",
        operationName: "ListStartups",
        responseKey: "Startups",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Sky Relay",
        minimumDocs: 0,
    },
    {
        trigger: "Tribes",
        route: "/tribes",
        title: "Tribes",
        operationName: "ListIdentities",
        responseKey: "Identities",
        expectedVariables: { limit: 20, page: 1 },
        expectedResultTitle: "Nova Rivers",
        minimumDocs: 0,
    },
];

export const SYNDICATION_LIST_GOAL = {
    clickLabel: "Manage endpoints",
    route: "/syndication",
    title: "Syndication",
    operationName: "ListPublishedSyndicationUrls",
    responseKey: "Syndications",
    expectedVariables: {},
    expectedResultTitle: "Main",
} as const;

export const DETAIL_HOME_GOALS: DetailGoal[] = [
    {
        selector: ".SplashEntityCard__itemLink",
        label: "Dockmaster",
        route: detailRoute("/jobs", "job-dockmaster"),
        title: "Dockmaster",
        detailTitleSelector: ".JobDetail__title",
        query: {
            operationName: "JobById",
            responseKey: "Job",
            expectedId: "job-dockmaster",
            expectedVariables: { id: "job-dockmaster" },
        },
    },
];

export const SEARCH_GOALS: SearchGoal[] = [
    {
        scopeLabel: "Posts",
        searchTitle: "Post search",
        term: "Harbor Operations",
        resultLabel: "Harbor Operations Digest",
        route: detailRoute("/posts", "post-harbor-operations-digest"),
        title: "Harbor Operations Digest",
        searchOperationName: "SearchPosts",
        detailOperationName: "PostById",
        expectedId: "post-harbor-operations-digest",
        responseKey: "Post",
        searchExpectedTitle: "Harbor Operations Digest",
        detailExpectedVariables: { id: "post-harbor-operations-digest" },
    },
    {
        scopeLabel: "Jobs",
        searchTitle: "Job search",
        term: "Dockmaster",
        resultLabel: "Dockmaster",
        route: detailRoute("/jobs", "job-dockmaster"),
        title: "Dockmaster",
        searchOperationName: "SearchJobs",
        detailOperationName: "JobById",
        expectedId: "job-dockmaster",
        responseKey: "Job",
        searchExpectedTitle: "Dockmaster",
        detailExpectedVariables: { id: "job-dockmaster" },
    },
    {
        scopeLabel: "Products / Services",
        searchTitle: "Product / Service search",
        term: "Solar Widget",
        resultLabel: "Solar Widget",
        route: detailRoute("/products-services", "product-solar-widget"),
        title: "Solar Widget",
        searchOperationName: "SearchProducts",
        detailOperationName: "ProductById",
        expectedId: "product-solar-widget",
        responseKey: "Product",
        searchExpectedTitle: "Solar Widget",
        detailExpectedVariables: { id: "product-solar-widget" },
    },
    {
        scopeLabel: "Companies",
        searchTitle: "Company search",
        term: "Harbor Labs",
        resultLabel: "Harbor Labs",
        route: detailRoute("/companies", "company-harbor-labs"),
        title: "Harbor Labs",
        searchOperationName: "SearchCompanies",
        detailOperationName: "CompanyById",
        expectedId: "company-harbor-labs",
        responseKey: "Company",
        searchExpectedTitle: "Harbor Labs",
        detailExpectedVariables: { id: "company-harbor-labs" },
    },
    {
        scopeLabel: "Tribes",
        searchTitle: "Tribe search",
        term: "Nova Rivers",
        resultLabel: "Nova Rivers",
        route: detailRoute("/tribes", "identity-nova"),
        title: "Nova Rivers",
        searchOperationName: "SearchIdentities",
        detailOperationName: "IdentityById",
        expectedId: "identity-nova",
        responseKey: "Identity",
        searchExpectedTitle: "Nova Rivers",
        detailExpectedVariables: { id: "identity-nova" },
    },
    {
        scopeLabel: "Ventures",
        searchTitle: "Startup search",
        term: "Sky Relay",
        resultLabel: "Sky Relay",
        route: detailRoute("/ventures", "startup-sky-relay"),
        title: "Sky Relay",
        searchOperationName: "SearchStartups",
        detailOperationName: "StartupById",
        expectedId: "startup-sky-relay",
        responseKey: "Startup",
        searchExpectedTitle: "Sky Relay",
        detailExpectedVariables: { id: "startup-sky-relay" },
    },
];

export const DEEP_DIVE_ROUTES = {
    home: "/",
    companies: "/companies",
    company: detailRoute("/companies", "company-harbor-labs"),
    job: detailRoute("/jobs", "job-dockmaster"),
    inactiveJob: detailRoute("/jobs", "job-harbor-watch"),
    venture: detailRoute("/ventures", "startup-sky-relay"),
    identity: detailRoute("/tribes", "identity-nova"),
} as const;
