import {
    FetchStatus,
    QueryKey,
    QueryObserverResult,
    QueryStatus,
    RefetchOptions,
    useMutation,
    useQueries,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import mergeWith from "lodash-es/mergeWith";
import maxBy from "lodash-es/maxBy";
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
    CreateCompanyDocument,
    useCreateCompanyMutation as useCreateCompanyMutationSingle,
    UpdateCompanyDocument,
    useUpdateCompanyMutation as useUpdateCompanyMutationSingle,
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
    CreateJobDocument,
    useCreateJobMutation as useCreateJobMutationSingle,
    UpdateJobDocument,
    useUpdateJobMutation as useUpdateJobMutationSingle,
    ListJobsDocument,
    useListJobsQuery as useListJobsQuerySingle,
    SearchJobsDocument,
    useSearchJobsQuery as useSearchJobsQuerySingle,
    ListCommentsByTargetDocument,
    useListCommentsByTargetQuery as useListCommentsByTargetQuerySingle,
    CreateCommentDocument,
    useCreateCommentMutation as useCreateCommentMutationSingle,
    CreateReplyToCommentDocument,
    useCreateReplyToCommentMutation as useCreateReplyToCommentMutationSingle,
    DeleteCommentDocument,
    useDeleteCommentMutation as useDeleteCommentMutationSingle,
    UpdateCommentContentDocument,
    useUpdateCommentContentMutation as useUpdateCommentContentMutationSingle,
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
    CreateProductDocument,
    useCreateProductMutation as useCreateProductMutationSingle,
    UpdateProductDocument,
    useUpdateProductMutation as useUpdateProductMutationSingle,
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
    CreateStartupDocument,
    useCreateStartupMutation as useCreateStartupMutationSingle,
    UpdateStartupDocument,
    useUpdateStartupMutation as useUpdateStartupMutationSingle,
} from "../generated/graphql";
import { gqlFetcher } from "../gqlFetcher";
import { useEndpointContext } from "./EndpointContext";

const deepMergeConcatArrays = <T>(a: T, b: T): T =>
    mergeWith({}, a, b, (left: any, right: any) => {
        if (Array.isArray(left) && Array.isArray(right)) {
            return [...left, ...right];
        }
        return undefined;
    });

type QueryResult<TQuery> = UseQueryResult<TQuery, Error>;

const merger = <TQuery>(data: TQuery[], action: (a: TQuery, b: TQuery) => TQuery) => data.slice(1).reduce((acc, item) => {
    return action(acc, item);
}, data[0]);

const combineResult = <TQuery>(
    results: readonly QueryResult<TQuery>[],
    mergeAction: (a: TQuery, b: TQuery) => TQuery,
) => {
    const data = merger(results.map(r => r.data!).filter(Boolean), mergeAction);
    const error = results.find((query) => query.error)?.error;
    const failureReason = results.find((query) => query.failureReason)?.failureReason;

    const isError = results.some((query) => query.isError);
    const isPending = results.some((query) => query.isPending);
    const isLoading = results.some((query) => query.isLoading);
    const isFetching = results.some((query) => query.isFetching);
    const isFetched = results.some((query) => query.isFetched);
    const isFetchedAfterMount = results.some((query) => query.isFetchedAfterMount);
    const isPaused = results.some((query) => query.isPaused);
    const isPlaceholderData = results.some((query) => query.isPlaceholderData);
    const isStale = results.some((query) => query.isStale);
    const isSuccess = results.length > 0 && results.every((query) => query.isSuccess);

    const status: QueryStatus = isPending ? "pending" : isError ? "error" : "success";
    const fetchStatus: FetchStatus = isFetching ? "fetching" : isPaused ? "paused" : "idle";

    const hasData = Array.isArray(data) ? data.length > 0 : Boolean(data);
    const isLoadingError = isError && !hasData;
    const isRefetchError = isError && hasData;

    const refetch = async (
        options?: RefetchOptions,
    ): Promise<QueryObserverResult<TQuery, Error>> => {
        const refetched = await Promise.all(results.map((query) => query.refetch(options)));
        return combineResult(refetched, mergeAction);
    };

    return {
        data,
        dataUpdatedAt: maxBy(results, (query) => query.dataUpdatedAt)?.dataUpdatedAt || 0,
        error,
        errorUpdateCount: results.reduce((sum, query) => sum + query.errorUpdateCount, 0),
        errorUpdatedAt: maxBy(results, (query) => query.errorUpdatedAt)?.errorUpdatedAt || 0,
        failureCount: results.reduce((sum, query) => sum + query.failureCount, 0),
        failureReason,
        fetchStatus,
        isError,
        isFetched,
        isFetchedAfterMount,
        isFetching,
        isInitialLoading: isLoading,
        isLoading,
        isLoadingError,
        isPaused,
        isPending,
        isPlaceholderData,
        isRefetchError,
        isRefetching: isFetching && !isPending,
        isStale,
        isSuccess,
        promise: Promise.all(results.map((query) => query.promise)),
        refetch,
        status,
    } as QueryResult<TQuery>;
};

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

type MutationVariablesWithUrl<TVariables extends object | undefined> =
    (TVariables extends undefined ? {} : TVariables) & { url?: string };

export type GeneratedUseMutationHook<TData, TVariables extends object | undefined> = {
    <TError = unknown, TContext = unknown>(
        options?: UseMutationOptions<TData, TError, TVariables, TContext>,
    ): UseMutationResult<TData, TError, TVariables, TContext>;
    fetcher: (
        variables: TVariables,
        options?: RequestInit["headers"],
    ) => () => Promise<TData>;
};

export type EnhancedUseMutationHook<TData, TVariables extends object | undefined> = {
    <TError = unknown, TContext = unknown>(
        options?: Omit<UseMutationOptions<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>, "mutationFn">,
    ): UseMutationResult<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>;
    fetcher: (
        variables: MutationVariablesWithUrl<TVariables>,
        options?: RequestInit["headers"],
    ) => () => Promise<TData>;
};

export const enhancedMutationFactory = <TData, TVariables extends object | undefined>(
    _useHook: GeneratedUseMutationHook<TData, TVariables>,
    mutation: string,
): EnhancedUseMutationHook<TData, TVariables> => {
    const useEnhancedMutation = <TError = unknown, TContext = unknown>(
        options?: Omit<UseMutationOptions<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>, "mutationFn">,
    ) => {
        return useMutation<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>(
            {
                mutationFn: (variables) => {
                    const { url, ...rest } = variables;
                    return gqlFetcher<TData, TVariables>(
                        mutation,
                        rest as TVariables,
                        undefined,
                        url,
                    )();
                },
                ...options,
            },
        );
    };

    useEnhancedMutation.fetcher = (
        variables: MutationVariablesWithUrl<TVariables>,
        options?: RequestInit["headers"],
    ) => {
        const { url, ...rest } = variables;
        return gqlFetcher<TData, TVariables>(mutation, rest as TVariables, options, url);
    };

    return useEnhancedMutation;
};

export const enhancedQueryFactory = <TQueryFnData, TVariables>(
    useHook:
        | GeneratedUseQueryHook<TQueryFnData, TVariables>
        | GeneratedUseQueryHookOptional<TQueryFnData, TVariables>,
    query: string,
    mergeAction: (a: TQueryFnData, b: TQueryFnData) => TQueryFnData = deepMergeConcatArrays,
) => {
    return (variables?: TVariables & { url?: string }, params?: Omit<UseQueryOptions, "queryKey" | "queryFn">, options?: Headers) => {
        const { enabled } = useEndpointContext();
        const urls = (variables?.url ? [variables.url] : enabled);
        return useQueries({
            queries: urls.map((url) => ({
                queryKey: [...useHook.getKey(variables as TVariables), url],
                queryFn: gqlFetcher<TQueryFnData, TVariables>(
                    query,
                    variables,
                    options,
                    url,
                ),
                ...params,
            })),
            combine: (result) =>
                combineResult(result, mergeAction),
        });
    };
}

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
export const useCreateCompanyMutation = enhancedMutationFactory(useCreateCompanyMutationSingle, CreateCompanyDocument);
export const useUpdateCompanyMutation = enhancedMutationFactory(useUpdateCompanyMutationSingle, UpdateCompanyDocument);
export const useCreateCommentMutation = enhancedMutationFactory(useCreateCommentMutationSingle, CreateCommentDocument);
export const useCreateReplyToCommentMutation = enhancedMutationFactory(useCreateReplyToCommentMutationSingle, CreateReplyToCommentDocument);
export const useDeleteCommentMutation = enhancedMutationFactory(useDeleteCommentMutationSingle, DeleteCommentDocument);
export const useCreateJobMutation = enhancedMutationFactory(useCreateJobMutationSingle, CreateJobDocument);
export const useUpdateJobMutation = enhancedMutationFactory(useUpdateJobMutationSingle, UpdateJobDocument);
export const useCreateProductMutation = enhancedMutationFactory(useCreateProductMutationSingle, CreateProductDocument);
export const useUpdateProductMutation = enhancedMutationFactory(useUpdateProductMutationSingle, UpdateProductDocument);
export const useCreateStartupMutation = enhancedMutationFactory(useCreateStartupMutationSingle, CreateStartupDocument);
export const useUpdateStartupMutation = enhancedMutationFactory(useUpdateStartupMutationSingle, UpdateStartupDocument);
export const useUpdateCommentContentMutation = enhancedMutationFactory(useUpdateCommentContentMutationSingle, UpdateCommentContentDocument);
