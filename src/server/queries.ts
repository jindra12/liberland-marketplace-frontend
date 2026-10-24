import {
    CommentDetailDocument,
    CompanyByIdDocument,
    IdentityByIdDocument,
    ListJobsByCompanyDocument,
    ListProductsByCompanyDocument,
    ListStartupsByCompanyDocument,
    ListPostsByCompanyDocument,
    ListCompaniesByIdentityDocument,
    ListJobsByIdentityDocument,
    ListProductsByIdentityDocument,
    ListStartupsByIdentityDocument,
    JobByIdDocument,
    ListPublishedSyndicationUrlsDocument,
    PostByIdDocument,
    ProductByIdDocument,
    StartupByIdDocument,
} from "../generated/graphql";
import type {
    CommentDetailQuery,
    CommentDetailQueryVariables,
    CompanyByIdQuery,
    CompanyByIdQueryVariables,
    IdentityByIdQuery,
    IdentityByIdQueryVariables,
    JobByIdQuery,
    JobByIdQueryVariables,
    ListCompaniesByIdentityQuery,
    ListCompaniesByIdentityQueryVariables,
    ListJobsByCompanyQuery,
    ListJobsByCompanyQueryVariables,
    ListJobsByIdentityQuery,
    ListJobsByIdentityQueryVariables,
    ListPostsByCompanyQuery,
    ListPostsByCompanyQueryVariables,
    ListProductsByCompanyQuery,
    ListProductsByCompanyQueryVariables,
    ListProductsByIdentityQuery,
    ListProductsByIdentityQueryVariables,
    ListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsQueryVariables,
    ListStartupsByCompanyQuery,
    ListStartupsByCompanyQueryVariables,
    ListStartupsByIdentityQuery,
    ListStartupsByIdentityQueryVariables,
    PostByIdQuery,
    PostByIdQueryVariables,
    ProductByIdQuery,
    ProductByIdQueryVariables,
    StartupByIdQuery,
    StartupByIdQueryVariables,
} from "../generated/graphql";
import { createServerQueryFetcher } from "./utils";

export const fetchCommentDetail = createServerQueryFetcher<CommentDetailQuery, CommentDetailQueryVariables>(
    CommentDetailDocument,
);
export const fetchCompanyById = createServerQueryFetcher<CompanyByIdQuery, CompanyByIdQueryVariables>(
    CompanyByIdDocument,
);
export const fetchIdentityById = createServerQueryFetcher<IdentityByIdQuery, IdentityByIdQueryVariables>(
    IdentityByIdDocument,
);
export const fetchListJobsByCompany = createServerQueryFetcher<ListJobsByCompanyQuery, ListJobsByCompanyQueryVariables>(
    ListJobsByCompanyDocument,
);
export const fetchListProductsByCompany = createServerQueryFetcher<
    ListProductsByCompanyQuery,
    ListProductsByCompanyQueryVariables
>(ListProductsByCompanyDocument);
export const fetchListStartupsByCompany = createServerQueryFetcher<
    ListStartupsByCompanyQuery,
    ListStartupsByCompanyQueryVariables
>(ListStartupsByCompanyDocument);
export const fetchListPostsByCompany = createServerQueryFetcher<ListPostsByCompanyQuery, ListPostsByCompanyQueryVariables>(
    ListPostsByCompanyDocument,
);
export const fetchListCompaniesByIdentity = createServerQueryFetcher<
    ListCompaniesByIdentityQuery,
    ListCompaniesByIdentityQueryVariables
>(ListCompaniesByIdentityDocument);
export const fetchListJobsByIdentity = createServerQueryFetcher<ListJobsByIdentityQuery, ListJobsByIdentityQueryVariables>(
    ListJobsByIdentityDocument,
);
export const fetchListProductsByIdentity = createServerQueryFetcher<
    ListProductsByIdentityQuery,
    ListProductsByIdentityQueryVariables
>(ListProductsByIdentityDocument);
export const fetchListStartupsByIdentity = createServerQueryFetcher<
    ListStartupsByIdentityQuery,
    ListStartupsByIdentityQueryVariables
>(ListStartupsByIdentityDocument);
export const fetchJobById = createServerQueryFetcher<JobByIdQuery, JobByIdQueryVariables>(JobByIdDocument);
export const fetchListPublishedSyndicationUrls = createServerQueryFetcher<
    ListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsQueryVariables
>(ListPublishedSyndicationUrlsDocument);
export const fetchPostById = createServerQueryFetcher<PostByIdQuery, PostByIdQueryVariables>(PostByIdDocument);
export const fetchProductById = createServerQueryFetcher<ProductByIdQuery, ProductByIdQueryVariables>(
    ProductByIdDocument,
);
export const fetchStartupById = createServerQueryFetcher<StartupByIdQuery, StartupByIdQueryVariables>(
    StartupByIdDocument,
);
