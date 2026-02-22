import { QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import {
    ListCompaniesByCreatorDocument,
    useListCompaniesByCreatorQuery as useListCompaniesByCreatorQuerySingle,
    CompanyByIdDocument,
    useCompanyByIdQuery as useCompanyByIdQuerySingle,
    ListCompaniesByIdentityDocument,
    useListCompaniesByIdentityQuery as useListCompaniesByIdentityQuerySingle,
    SearchCompaniesByIdentityDocument,
    useSearchCompaniesByIdentityQuery as useSearchCompaniesByIdentityQuerySingle,
    ListCompaniesBySecondaryIdentityDocument,
    useListCompaniesBySecondaryIdentityQuery as useListCompaniesBySecondaryIdentityQuerySingle,
    SearchCompaniesBySecondaryIdentityDocument,
    useSearchCompaniesBySecondaryIdentityQuery as useSearchCompaniesBySecondaryIdentityQuerySingle,
    ListCompaniesDocument,
    useListCompaniesQuery as useListCompaniesQuerySingle,
    SearchCompaniesDocument,
    useSearchCompaniesQuery as useSearchCompaniesQuerySingle,
    IdentityByIdDocument,
    useIdentityByIdQuery as useIdentityByIdQuerySingle,
    ListIdentitiesDocument,
    useListIdentitiesQuery as useListIdentitiesQuerySingle,
    SearchIdentitiesDocument,
    useSearchIdentitiesQuery as useSearchIdentitiesQuerySingle,
    ListJobsByCompanyDocument,
    useListJobsByCompanyQuery as useListJobsByCompanyQuerySingle,
    SearchJobsByCompanyDocument,
    useSearchJobsByCompanyQuery as useSearchJobsByCompanyQuerySingle,
    ListJobsByCreatorDocument,
    useListJobsByCreatorQuery as useListJobsByCreatorQuerySingle,
    JobByIdDocument,
    useJobByIdQuery as useJobByIdQuerySingle,
    ListJobsBySecondaryIdentityDocument,
    useListJobsBySecondaryIdentityQuery as useListJobsBySecondaryIdentityQuerySingle,
    SearchJobsBySecondaryIdentityDocument,
    useSearchJobsBySecondaryIdentityQuery as useSearchJobsBySecondaryIdentityQuerySingle,
    ListJobsDocument,
    useListJobsQuery as useListJobsQuerySingle,
    SearchJobsDocument,
    useSearchJobsQuery as useSearchJobsQuerySingle,
    ListCommentsByTargetDocument,
    useListCommentsByTargetQuery as useListCommentsByTargetQuerySingle,
    ListJobsByIdentityDocument,
    useListJobsByIdentityQuery as useListJobsByIdentityQuerySingle,
    ListProductsByIdentityDocument,
    useListProductsByIdentityQuery as useListProductsByIdentityQuerySingle,
    ListRepliesToCommentDocument,
    useListRepliesToCommentQuery as useListRepliesToCommentQuerySingle,
    ListProductsByCompanyDocument,
    useListProductsByCompanyQuery as useListProductsByCompanyQuerySingle,
    SearchProductsByCompanyDocument,
    useSearchProductsByCompanyQuery as useSearchProductsByCompanyQuerySingle,
    ListProductsByCreatorDocument,
    useListProductsByCreatorQuery as useListProductsByCreatorQuerySingle,
    ProductByIdDocument,
    useProductByIdQuery as useProductByIdQuerySingle,
    ListProductsDocument,
    useListProductsQuery as useListProductsQuerySingle,
    SearchProductsDocument,
    useSearchProductsQuery as useSearchProductsQuerySingle,
    ListStartupsByCreatorDocument,
    useListStartupsByCreatorQuery as useListStartupsByCreatorQuerySingle,
    StartupByIdDocument,
    useStartupByIdQuery as useStartupByIdQuerySingle,
    ListStartupsDocument,
    useListStartupsQuery as useListStartupsQuerySingle,
    SearchStartupsDocument,
    useSearchStartupsQuery as useSearchStartupsQuerySingle,
} from "../generated/graphql";

export type GeneratedUseQueryHook<TQueryFnData, TVariables> =
    (<TData = TQueryFnData, TError = unknown>(
        variables: TVariables,
        options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey"> & {
            queryKey?: UseQueryOptions<TQueryFnData, TError, TData>["queryKey"];
        },
    ) => UseQueryResult<TData, TError>) & {
        getKey: (variables: TVariables) => QueryKey;
        fetcher: (
            variables: TVariables,
            options?: RequestInit["headers"],
        ) => () => Promise<TQueryFnData>;
    };

export type GeneratedUseQueryHookOptional<TQueryFnData, TVariables> =
    (<TData = TQueryFnData, TError = unknown>(
        variables?: TVariables,
        options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey"> & {
            queryKey?: UseQueryOptions<TQueryFnData, TError, TData>["queryKey"];
        },
    ) => UseQueryResult<TData, TError>) & {
        getKey: (variables?: TVariables) => QueryKey;
        fetcher: (
            variables?: TVariables,
            options?: RequestInit["headers"],
        ) => () => Promise<TQueryFnData>;
    };

export const enhancedQueryFactory = <THook>(useHook: THook, _query: string): THook => useHook;

export const useListCompaniesByCreatorQuery = enhancedQueryFactory(useListCompaniesByCreatorQuerySingle, ListCompaniesByCreatorDocument);
export const useCompanyByIdQuery = enhancedQueryFactory(useCompanyByIdQuerySingle, CompanyByIdDocument);
export const useListCompaniesByIdentityQuery = enhancedQueryFactory(useListCompaniesByIdentityQuerySingle, ListCompaniesByIdentityDocument);
export const useSearchCompaniesByIdentityQuery = enhancedQueryFactory(useSearchCompaniesByIdentityQuerySingle, SearchCompaniesByIdentityDocument);
export const useListCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(useListCompaniesBySecondaryIdentityQuerySingle, ListCompaniesBySecondaryIdentityDocument);
export const useSearchCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(useSearchCompaniesBySecondaryIdentityQuerySingle, SearchCompaniesBySecondaryIdentityDocument);
export const useListCompaniesQuery = enhancedQueryFactory(useListCompaniesQuerySingle, ListCompaniesDocument);
export const useSearchCompaniesQuery = enhancedQueryFactory(useSearchCompaniesQuerySingle, SearchCompaniesDocument);
export const useIdentityByIdQuery = enhancedQueryFactory(useIdentityByIdQuerySingle, IdentityByIdDocument);
export const useListIdentitiesQuery = enhancedQueryFactory(useListIdentitiesQuerySingle, ListIdentitiesDocument);
export const useSearchIdentitiesQuery = enhancedQueryFactory(useSearchIdentitiesQuerySingle, SearchIdentitiesDocument);
export const useListJobsByCompanyQuery = enhancedQueryFactory(useListJobsByCompanyQuerySingle, ListJobsByCompanyDocument);
export const useSearchJobsByCompanyQuery = enhancedQueryFactory(useSearchJobsByCompanyQuerySingle, SearchJobsByCompanyDocument);
export const useListJobsByCreatorQuery = enhancedQueryFactory(useListJobsByCreatorQuerySingle, ListJobsByCreatorDocument);
export const useJobByIdQuery = enhancedQueryFactory(useJobByIdQuerySingle, JobByIdDocument);
export const useListJobsBySecondaryIdentityQuery = enhancedQueryFactory(useListJobsBySecondaryIdentityQuerySingle, ListJobsBySecondaryIdentityDocument);
export const useSearchJobsBySecondaryIdentityQuery = enhancedQueryFactory(useSearchJobsBySecondaryIdentityQuerySingle, SearchJobsBySecondaryIdentityDocument);
export const useListJobsQuery = enhancedQueryFactory(useListJobsQuerySingle, ListJobsDocument);
export const useSearchJobsQuery = enhancedQueryFactory(useSearchJobsQuerySingle, SearchJobsDocument);
export const useListCommentsByTargetQuery = enhancedQueryFactory(useListCommentsByTargetQuerySingle, ListCommentsByTargetDocument);
export const useListJobsByIdentityQuery = enhancedQueryFactory(useListJobsByIdentityQuerySingle, ListJobsByIdentityDocument);
export const useListProductsByIdentityQuery = enhancedQueryFactory(useListProductsByIdentityQuerySingle, ListProductsByIdentityDocument);
export const useListRepliesToCommentQuery = enhancedQueryFactory(useListRepliesToCommentQuerySingle, ListRepliesToCommentDocument);
export const useListProductsByCompanyQuery = enhancedQueryFactory(useListProductsByCompanyQuerySingle, ListProductsByCompanyDocument);
export const useSearchProductsByCompanyQuery = enhancedQueryFactory(useSearchProductsByCompanyQuerySingle, SearchProductsByCompanyDocument);
export const useListProductsByCreatorQuery = enhancedQueryFactory(useListProductsByCreatorQuerySingle, ListProductsByCreatorDocument);
export const useProductByIdQuery = enhancedQueryFactory(useProductByIdQuerySingle, ProductByIdDocument);
export const useListProductsQuery = enhancedQueryFactory(useListProductsQuerySingle, ListProductsDocument);
export const useSearchProductsQuery = enhancedQueryFactory(useSearchProductsQuerySingle, SearchProductsDocument);
export const useListStartupsByCreatorQuery = enhancedQueryFactory(useListStartupsByCreatorQuerySingle, ListStartupsByCreatorDocument);
export const useStartupByIdQuery = enhancedQueryFactory(useStartupByIdQuerySingle, StartupByIdDocument);
export const useListStartupsQuery = enhancedQueryFactory(useListStartupsQuerySingle, ListStartupsDocument);
export const useSearchStartupsQuery = enhancedQueryFactory(useSearchStartupsQuerySingle, SearchStartupsDocument);
