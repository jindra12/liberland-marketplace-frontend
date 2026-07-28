import type { Comment, Company, Identity, Job, Post, Product, Startup } from "./generated/graphql";
import type { URL } from "./types";

import type { PostRelatedTarget } from "./components/shared/post/types";

export const encodeServerUrlSegment = (value: string) => {
    return Buffer.from(value, "utf8").toString("hex");
};

export const decodeServerUrlSegment = (value: string) => {
    if (!value || value.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(value)) {
        return "";
    }

    return Buffer.from(value, "hex").toString("utf8");
};

const home = {
    route: "/",
    getLink: () => "/",
};

const jobs = {
    route: "/jobs",
    getLink: () => "/jobs",
    detail: {
        route: "/jobs/:id/:serverUrl",
        getLink: (job: Job) => `/jobs/${job.id}/${encodeServerUrlSegment(job.serverURL ?? "")}`,
    },
    edit: {
        route: "/jobs/edit/:id/:serverUrl",
        getLink: (job: Job) => `/jobs/edit/${job.id}/${encodeServerUrlSegment(job.serverURL ?? "")}`,
    },
};

const companies = {
    route: "/companies",
    getLink: () => "/companies",
    detail: {
        route: "/companies/:id/:serverUrl",
        getLink: (company: Company) => `/companies/${company.id}/${encodeServerUrlSegment(company.serverURL ?? "")}`,
    },
    edit: {
        route: "/companies/edit/:id/:serverUrl",
        getLink: (company: Company) => `/companies/edit/${company.id}/${encodeServerUrlSegment(company.serverURL ?? "")}`,
    },
};

const tribes = {
    route: "/tribes",
    getLink: () => "/tribes",
    detail: {
        route: "/tribes/:id/:serverUrl",
        getLink: (identity: Identity) => `/tribes/${identity.id}/${encodeServerUrlSegment(identity.serverURL ?? "")}`,
    },
};

const productsServices = {
    route: "/products-services",
    getLink: () => "/products-services",
    detail: {
        route: "/products-services/:id/:serverUrl",
        getLink: (product: Product) =>
            `/products-services/${product.id}/${encodeServerUrlSegment(product.serverURL ?? "")}`,
    },
    edit: {
        route: "/products-services/edit/:id/:serverUrl",
        getLink: (product: Product) =>
            `/products-services/edit/${product.id}/${encodeServerUrlSegment(product.serverURL ?? "")}`,
    },
};

const posts = {
    route: "/posts",
    getLink: () => "/posts",
    detail: {
        route: "/posts/:id/:serverUrl",
        getLink: (post: Post) => `/posts/${post.id}/${encodeServerUrlSegment(post.company?.serverURL ?? "")}`,
    },
    edit: {
        route: "/posts/edit/:id/:serverUrl",
        getLink: (post: Post) => `/posts/edit/${post.id}/${encodeServerUrlSegment(post.company?.serverURL ?? "")}`,
    },
    relatedTarget: {
        getLink: (related: PostRelatedTarget) => {
            const value = related?.value;
            if (!value) {
                return "";
            }

            switch (value.__typename) {
                case "Post":
                    return posts.detail.getLink(value as Post);
                case "Company":
                    return companies.detail.getLink(value as Company);
                case "Job":
                    return jobs.detail.getLink(value as Job);
                case "Product":
                    return productsServices.detail.getLink(value as Product);
                case "Identity":
                    return tribes.detail.getLink(value as unknown as Identity);
                case "Startup":
                    return ventures.detail.getLink(value as Startup);
            }

            return "";
        },
    },
};

const syndication = {
    route: "/syndication",
    getLink: () => "/syndication",
    detail: {
        route: "/syndication/:id/:serverUrl",
        getLink: (entry: URL) => `/syndication/${encodeURIComponent(entry.value)}/${encodeServerUrlSegment(entry.value)}`,
    },
};

const syndicate = {
    route: "/syndicate",
    getLink: () => "/syndicate",
};

const profile = {
    route: "/profile",
    getLink: () => "/profile",
};

const publish = {
    route: "/publish",
    getLink: () => "/publish",
};

const cart = {
    route: "/cart",
    getLink: () => "/cart",
};

const order = {
    route: "/order",
    getLink: () => "/order",
};

const orders = {
    route: "/orders",
    getLink: () => "/orders",
};

const ventures = {
    route: "/ventures",
    getLink: () => "/ventures",
    detail: {
        route: "/ventures/:id/:serverUrl",
        getLink: (startup: Startup) => `/ventures/${startup.id}/${encodeServerUrlSegment(startup.serverURL ?? "")}`,
    },
    edit: {
        route: "/ventures/edit/:id/:serverUrl",
        getLink: (startup: Startup) =>
            `/ventures/edit/${startup.id}/${encodeServerUrlSegment(startup.serverURL ?? "")}`,
    },
};

const unsubscribe = {
    route: "/unsubscribe",
    getLink: () => "/unsubscribe",
};

const authCallback = {
    route: "/auth/callback",
    getLink: () => "/auth/callback",
};

const comments = {
    detail: {
        route: "/comments/:id/:serverUrl",
        getLink: (comment: Comment) => `/comments/${comment.id}/${encodeServerUrlSegment(comment.serverUrl ?? "")}`,
    },
};

export const routes = {
    home,
    jobs,
    companies,
    tribes,
    productsServices,
    posts,
    syndication,
    syndicate,
    profile,
    publish,
    cart,
    order,
    orders,
    ventures,
    unsubscribe,
    authCallback,
    comments,
} as const;
