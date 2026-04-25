import type { Comment, Company, Identity, Job, Post, Product, Startup } from "./generated/graphql";
import type { URL } from "./types";

import type { PostRelatedTarget } from "./components/shared/post/types";
import { Post_RelatedPosts_RelationTo } from "./generated/graphql";

const home = {
    route: "/" as const,
    getLink: () => "/" as const,
};

const jobs = {
    route: "/jobs" as const,
    getLink: () => "/jobs" as const,
    detail: {
        route: "/jobs/:id" as const,
        getLink: (job: Job) => `/jobs/${job.id}`,
    },
    edit: {
        route: "/jobs/edit/:id" as const,
        getLink: (job: Job) => `/jobs/edit/${job.id}`,
    },
};

const companies = {
    route: "/companies" as const,
    getLink: () => "/companies" as const,
    detail: {
        route: "/companies/:id" as const,
        getLink: (company: Company) => `/companies/${company.id}`,
    },
    edit: {
        route: "/companies/edit/:id" as const,
        getLink: (company: Company) => `/companies/edit/${company.id}`,
    },
};

const tribes = {
    route: "/tribes" as const,
    getLink: () => "/tribes" as const,
    detail: {
        route: "/tribes/:id" as const,
        getLink: (identity: Identity) => `/tribes/${identity.id}`,
    },
};

const productsServices = {
    route: "/products-services" as const,
    getLink: () => "/products-services" as const,
    detail: {
        route: "/products-services/:id" as const,
        getLink: (product: Product) => `/products-services/${product.id}`,
    },
    edit: {
        route: "/products-services/edit/:id" as const,
        getLink: (product: Product) => `/products-services/edit/${product.id}`,
    },
};

const posts = {
    route: "/posts" as const,
    getLink: () => "/posts" as const,
    detail: {
        route: "/posts/:id" as const,
        getLink: (post: Post) => `/posts/${post.id}`,
    },
    edit: {
        route: "/posts/edit/:id" as const,
        getLink: (post: Post) => `/posts/edit/${post.id}`,
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
        route: "/syndication/:id" as const,
        getLink: (entry: URL) => `/syndication/${encodeURIComponent(entry.value)}`,
    },
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
        route: "/ventures/:id" as const,
        getLink: (startup: Startup) => `/ventures/${startup.id}`,
    },
    edit: {
        route: "/ventures/edit/:id" as const,
        getLink: (startup: Startup) => `/ventures/edit/${startup.id}`,
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
        route: "/comments/:id" as const,
        getLink: (comment: Comment) => `/comments/${comment.id}`,
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
    profile,
    publish,
    cart,
    order,
    ventures,
    unsubscribe,
    authCallback,
    comments,
} as const;
