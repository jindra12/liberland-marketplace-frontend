import type { Comment, Company, Identity, Job, Post, Product, Startup } from "./generated/graphql";
import type { URL } from "./types";

import type { PostRelatedTarget } from "./components/shared/post/types";
import { Post_RelatedPosts_RelationTo } from "./generated/graphql";

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
    route: "/" as const,
    getLink: () => "/" as const,
};

const jobs = {
    route: "/jobs" as const,
    getLink: () => "/jobs" as const,
    detail: {
        route: "/jobs/:id/:serverUrl" as const,
        getLink: (job: Job) => `/jobs/${job.id}/${encodeServerUrlSegment(job.serverURL ?? "")}`,
    },
    edit: {
        route: "/jobs/edit/:id/:serverUrl" as const,
        getLink: (job: Job) => `/jobs/edit/${job.id}/${encodeServerUrlSegment(job.serverURL ?? "")}`,
    },
};

const companies = {
    route: "/companies" as const,
    getLink: () => "/companies" as const,
    detail: {
        route: "/companies/:id/:serverUrl" as const,
        getLink: (company: Company) => `/companies/${company.id}/${encodeServerUrlSegment(company.serverURL ?? "")}`,
    },
    edit: {
        route: "/companies/edit/:id/:serverUrl" as const,
        getLink: (company: Company) => `/companies/edit/${company.id}/${encodeServerUrlSegment(company.serverURL ?? "")}`,
    },
};

const tribes = {
    route: "/tribes" as const,
    getLink: () => "/tribes" as const,
    detail: {
        route: "/tribes/:id/:serverUrl" as const,
        getLink: (identity: Identity) => `/tribes/${identity.id}/${encodeServerUrlSegment(identity.serverURL ?? "")}`,
    },
};

const productsServices = {
    route: "/products-services" as const,
    getLink: () => "/products-services" as const,
    detail: {
        route: "/products-services/:id/:serverUrl" as const,
        getLink: (product: Product) =>
            `/products-services/${product.id}/${encodeServerUrlSegment(product.serverURL ?? "")}`,
    },
    edit: {
        route: "/products-services/edit/:id/:serverUrl" as const,
        getLink: (product: Product) =>
            `/products-services/edit/${product.id}/${encodeServerUrlSegment(product.serverURL ?? "")}`,
    },
};

const posts = {
    route: "/posts" as const,
    getLink: () => "/posts" as const,
    detail: {
        route: "/posts/:id/:serverUrl" as const,
        getLink: (post: Post) => `/posts/${post.id}/${encodeServerUrlSegment(post.company?.serverURL ?? "")}`,
    },
    edit: {
        route: "/posts/edit/:id/:serverUrl" as const,
        getLink: (post: Post) => `/posts/edit/${post.id}/${encodeServerUrlSegment(post.company?.serverURL ?? "")}`,
    },
    relatedTarget: {
        getLink: (related: PostRelatedTarget) => {
            if (!related?.value || !related.relationTo) {
                return "";
            }

            const relatedValue = related.value as { id: string };

            switch (related.relationTo) {
                case Post_RelatedPosts_RelationTo.Posts:
                    return posts.detail.getLink(relatedValue as Post);
                case Post_RelatedPosts_RelationTo.Companies:
                    return companies.detail.getLink(relatedValue as Company);
                case Post_RelatedPosts_RelationTo.Jobs:
                    return jobs.detail.getLink(relatedValue as Job);
                case Post_RelatedPosts_RelationTo.Products:
                    return productsServices.detail.getLink(relatedValue as Product);
                case Post_RelatedPosts_RelationTo.Identities:
                    return tribes.detail.getLink(relatedValue as Identity);
                case Post_RelatedPosts_RelationTo.Startups:
                    return ventures.detail.getLink(relatedValue as Startup);
            }

            return "";
        },
    },
};

const syndication = {
    route: "/syndication" as const,
    getLink: () => "/syndication" as const,
    detail: {
        route: "/syndication/:id/:serverUrl" as const,
        getLink: (entry: URL) => `/syndication/${encodeURIComponent(entry.value)}/${encodeServerUrlSegment(entry.value)}`,
    },
};

const syndicate = {
    route: "/syndicate" as const,
    getLink: () => "/syndicate" as const,
};

const profile = {
    route: "/profile" as const,
    getLink: () => "/profile" as const,
};

const publish = {
    route: "/publish" as const,
    getLink: () => "/publish" as const,
};

const cart = {
    route: "/cart" as const,
    getLink: () => "/cart" as const,
};

const order = {
    route: "/order" as const,
    getLink: () => "/order" as const,
};

const ventures = {
    route: "/ventures" as const,
    getLink: () => "/ventures" as const,
    detail: {
        route: "/ventures/:id/:serverUrl" as const,
        getLink: (startup: Startup) => `/ventures/${startup.id}/${encodeServerUrlSegment(startup.serverURL ?? "")}`,
    },
    edit: {
        route: "/ventures/edit/:id/:serverUrl" as const,
        getLink: (startup: Startup) =>
            `/ventures/edit/${startup.id}/${encodeServerUrlSegment(startup.serverURL ?? "")}`,
    },
};

const unsubscribe = {
    route: "/unsubscribe" as const,
    getLink: () => "/unsubscribe" as const,
};

const authCallback = {
    route: "/auth/callback" as const,
    getLink: () => "/auth/callback" as const,
};

const comments = {
    detail: {
        route: "/comments/:id/:serverUrl" as const,
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
    ventures,
    unsubscribe,
    authCallback,
    comments,
} as const;
