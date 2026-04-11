import {
    QueryKey,
    useMutation,
    useQueries,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    Query,
    useQueryClient,
} from "@tanstack/react-query";
import {
    CartBySecretDocument,
    useCartBySecretQuery as useCartBySecretQuerySingle,
    CreateCartDocument,
    useCreateCartMutation as useCreateCartMutationSingle,
    DeleteCartDocument,
    useDeleteCartMutation as useDeleteCartMutationSingle,
    UpdateCartDocument,
    useUpdateCartMutation as useUpdateCartMutationSingle,
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
    DeleteCompanyDocument,
    useDeleteCompanyMutation as useDeleteCompanyMutationSingle,
    UpdateCompanyDocument,
    useUpdateCompanyMutation as useUpdateCompanyMutationSingle,
    IdentityByIdDocument,
    useIdentityByIdQuery as useIdentityByIdQuerySingle,
    EntityImageUrlsDocument,
    useEntityImageUrlsQuery as useEntityImageUrlsQuerySingle,
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
    DeleteJobDocument,
    useDeleteJobMutation as useDeleteJobMutationSingle,
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
    CreateOrderDocument,
    useCreateOrderMutation as useCreateOrderMutationSingle,
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
    DeleteProductDocument,
    useDeleteProductMutation as useDeleteProductMutationSingle,
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
    JoinStartupDocument,
    useJoinStartupMutation as useJoinStartupMutationSingle,
    LeaveStartupDocument,
    useLeaveStartupMutation as useLeaveStartupMutationSingle,
    ListStartupsByCompanyDocument,
    useListStartupsByCompanyQuery as useListStartupsByCompanyQuerySingle,
    ListStartupsByCreatorDocument,
    useListStartupsByCreatorQuery as useListStartupsByCreatorQuerySingle,
    ListStartupsByIdentityDocument,
    useListStartupsByIdentityQuery as useListStartupsByIdentityQuerySingle,
    StartupByIdDocument,
    useStartupByIdQuery as useStartupByIdQuerySingle,
    ListStartupsDocument,
    useListStartupsQuery as useListStartupsQuerySingle,
    SearchStartupsDocument,
    useSearchStartupsQuery as useSearchStartupsQuerySingle,
    CreateStartupDocument,
    useCreateStartupMutation as useCreateStartupMutationSingle,
    DeleteStartupDocument,
    useDeleteStartupMutation as useDeleteStartupMutationSingle,
    TrackAnalyticsEventDocument,
    useTrackAnalyticsEventMutation as useTrackAnalyticsEventMutationSingle,
    UpdateStartupDocument,
    useUpdateStartupMutation as useUpdateStartupMutationSingle,
    UpdateOrderDocument,
    useUpdateOrderMutation as useUpdateOrderMutationSingle,
    MeUserDocument,
    useMeUserQuery as useMeUserQuerySingle,
    SubscribeToCompanyUpdatesDocument,
    useSubscribeToCompanyUpdatesMutation as useSubscribeToCompanyUpdatesMutationSingle,
    SubscribeToJobUpdatesDocument,
    useSubscribeToJobUpdatesMutation as useSubscribeToJobUpdatesMutationSingle,
    SubscribeToProductUpdatesDocument,
    useSubscribeToProductUpdatesMutation as useSubscribeToProductUpdatesMutationSingle,
    SubscribeToTribeUpdatesDocument,
    useSubscribeToTribeUpdatesMutation as useSubscribeToTribeUpdatesMutationSingle,
    SubscribeToVentureUpdatesDocument,
    useSubscribeToVentureUpdatesMutation as useSubscribeToVentureUpdatesMutationSingle,
    UnsubscribeFromCompanyUpdatesDocument,
    useUnsubscribeFromCompanyUpdatesMutation as useUnsubscribeFromCompanyUpdatesMutationSingle,
    UnsubscribeFromJobUpdatesDocument,
    useUnsubscribeFromJobUpdatesMutation as useUnsubscribeFromJobUpdatesMutationSingle,
    UnsubscribeFromProductUpdatesDocument,
    useUnsubscribeFromProductUpdatesMutation as useUnsubscribeFromProductUpdatesMutationSingle,
    UnsubscribeFromTribeUpdatesDocument,
    useUnsubscribeFromTribeUpdatesMutation as useUnsubscribeFromTribeUpdatesMutationSingle,
    UnsubscribeFromVentureUpdatesDocument,
    useUnsubscribeFromVentureUpdatesMutation as useUnsubscribeFromVentureUpdatesMutationSingle,
    UpdateUserByIdDocument,
    useUpdateUserByIdMutation as useUpdateUserByIdMutationSingle,
    MeUserQuery,
} from "../generated/graphql";
import { gqlFetcher } from "../gqlFetcher";
import { useEndpointContext } from "./EndpointContext";
import { combineResult, deepMergeConcatArrays } from "./query/utils";

export type GeneratedUseQueryHook<TQueryFnData, TVariables> = (<TData = TQueryFnData, TError = unknown>(
    variables: TVariables,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey"> & {
        queryKey?: UseQueryOptions<TQueryFnData, TError, TData>["queryKey"];
    },
) => UseQueryResult<TData, TError>) & {
    getKey: (variables: TVariables) => QueryKey;
    fetcher: (variables: TVariables, options?: RequestInit["headers"]) => () => Promise<TQueryFnData>;
};

type QueryVariablesWithUrl<TVariables extends object | undefined> = TVariables extends undefined
    ? { url?: string | null }
    : TVariables extends Record<string, never>
      ? { url?: string | null }
      : TVariables & { url?: string | null };

type MutationVariablesWithUrl<TVariables extends object | undefined> = (TVariables extends undefined
    ? {}
    : TVariables) & { url?: string | null };

export type GeneratedUseMutationHook<TData, TVariables extends object | undefined> = {
    <TError = unknown, TContext = unknown>(
        options?: UseMutationOptions<TData, TError, TVariables, TContext>,
    ): UseMutationResult<TData, TError, TVariables, TContext>;
    fetcher: (variables: TVariables, options?: RequestInit["headers"]) => () => Promise<TData>;
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
        return useMutation<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>({
            mutationFn: (variables) => {
                const { url, ...rest } = variables;
                return gqlFetcher<TData, TVariables>(mutation, rest as TVariables, undefined, url)();
            },
            ...options,
        });
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

export const enhancedQueryFactory = <TQueryFnData, TVariables extends object | undefined, TResult = TQueryFnData>(
    useHook: GeneratedUseQueryHook<TQueryFnData, TVariables>,
    query: string,
    mergeAction: (a: TQueryFnData, b: TQueryFnData) => TResult = deepMergeConcatArrays,
) => {
    return (
        variables?: QueryVariablesWithUrl<TVariables>,
        params?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
        options?: Headers,
    ) => {
        const { enabled } = useEndpointContext();
        const urls = variables?.url ? [variables.url] : enabled;
        const client = useQueryClient();

        return useQueries({
            queries: urls.map((url) => ({
                queryKey: [...useHook.getKey(variables as TVariables), url],
                queryFn: gqlFetcher<TQueryFnData, TVariables>(query, variables as TVariables, options, url),
                enabled: (query: Query) => {
                    const queryVariables = query.queryKey[1];
                    if (queryVariables && typeof queryVariables === "object" && "page" in queryVariables) {
                        const { page } = queryVariables as { page: number };
                        const prevKey = useHook.getKey({
                            ...queryVariables,
                            page: page - 1,
                        } as TVariables);
                        const prevQuery = client.getQueryData(prevKey) as {
                            hasNextPage?: boolean,
                        };
                        return prevQuery?.hasNextPage !== false;
                    }
                    return true;
                },
                ...params,
            })),
            combine: (result) => combineResult(result, mergeAction as any) as UseQueryResult<TResult>,
        });
    };
};

export const useListCompaniesByCreatorQuery = enhancedQueryFactory(
    useListCompaniesByCreatorQuerySingle,
    ListCompaniesByCreatorDocument,
);
export const useCartBySecretQuery = enhancedQueryFactory(useCartBySecretQuerySingle, CartBySecretDocument);
export const useCompanyByIdQuery = enhancedQueryFactory(useCompanyByIdQuerySingle, CompanyByIdDocument);
export const useListCompaniesByIdentityQuery = enhancedQueryFactory(
    useListCompaniesByIdentityQuerySingle,
    ListCompaniesByIdentityDocument,
);
export const useSearchCompaniesByIdentityQuery = enhancedQueryFactory(
    useSearchCompaniesByIdentityQuerySingle,
    SearchCompaniesByIdentityDocument,
);
export const useListCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(
    useListCompaniesBySecondaryIdentityQuerySingle,
    ListCompaniesBySecondaryIdentityDocument,
);
export const useSearchCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(
    useSearchCompaniesBySecondaryIdentityQuerySingle,
    SearchCompaniesBySecondaryIdentityDocument,
);
export const useListCompaniesQuery = enhancedQueryFactory(useListCompaniesQuerySingle, ListCompaniesDocument);
export const useSearchCompaniesQuery = enhancedQueryFactory(useSearchCompaniesQuerySingle, SearchCompaniesDocument);
export const useIdentityByIdQuery = enhancedQueryFactory(useIdentityByIdQuerySingle, IdentityByIdDocument);
export const useEntityImageUrlsQuery = enhancedQueryFactory(useEntityImageUrlsQuerySingle, EntityImageUrlsDocument);
export const useListIdentitiesQuery = enhancedQueryFactory(useListIdentitiesQuerySingle, ListIdentitiesDocument);
export const useSearchIdentitiesQuery = enhancedQueryFactory(useSearchIdentitiesQuerySingle, SearchIdentitiesDocument);
export const useListJobsByCompanyQuery = enhancedQueryFactory(
    useListJobsByCompanyQuerySingle,
    ListJobsByCompanyDocument,
);
export const useSearchJobsByCompanyQuery = enhancedQueryFactory(
    useSearchJobsByCompanyQuerySingle,
    SearchJobsByCompanyDocument,
);
export const useListJobsByCreatorQuery = enhancedQueryFactory(
    useListJobsByCreatorQuerySingle,
    ListJobsByCreatorDocument,
);
export const useJobByIdQuery = enhancedQueryFactory(useJobByIdQuerySingle, JobByIdDocument);
export const useListJobsBySecondaryIdentityQuery = enhancedQueryFactory(
    useListJobsBySecondaryIdentityQuerySingle,
    ListJobsBySecondaryIdentityDocument,
);
export const useSearchJobsBySecondaryIdentityQuery = enhancedQueryFactory(
    useSearchJobsBySecondaryIdentityQuerySingle,
    SearchJobsBySecondaryIdentityDocument,
);
export const useListJobsQuery = enhancedQueryFactory(useListJobsQuerySingle, ListJobsDocument);
export const useSearchJobsQuery = enhancedQueryFactory(useSearchJobsQuerySingle, SearchJobsDocument);
export const useListCommentsByTargetQuery = enhancedQueryFactory(
    useListCommentsByTargetQuerySingle,
    ListCommentsByTargetDocument,
);
export const useListJobsByIdentityQuery = enhancedQueryFactory(
    useListJobsByIdentityQuerySingle,
    ListJobsByIdentityDocument,
);
export const useListProductsByIdentityQuery = enhancedQueryFactory(
    useListProductsByIdentityQuerySingle,
    ListProductsByIdentityDocument,
);
export const useListRepliesToCommentQuery = enhancedQueryFactory(
    useListRepliesToCommentQuerySingle,
    ListRepliesToCommentDocument,
);
export const useListProductsByCompanyQuery = enhancedQueryFactory(
    useListProductsByCompanyQuerySingle,
    ListProductsByCompanyDocument,
);
export const useSearchProductsByCompanyQuery = enhancedQueryFactory(
    useSearchProductsByCompanyQuerySingle,
    SearchProductsByCompanyDocument,
);
export const useListProductsByCreatorQuery = enhancedQueryFactory(
    useListProductsByCreatorQuerySingle,
    ListProductsByCreatorDocument,
);
export const useProductByIdQuery = enhancedQueryFactory(useProductByIdQuerySingle, ProductByIdDocument);
export const useListProductsQuery = enhancedQueryFactory(useListProductsQuerySingle, ListProductsDocument);
export const useSearchProductsQuery = enhancedQueryFactory(useSearchProductsQuerySingle, SearchProductsDocument);
export const useListStartupsByCompanyQuery = enhancedQueryFactory(
    useListStartupsByCompanyQuerySingle,
    ListStartupsByCompanyDocument,
);
export const useListStartupsByCreatorQuery = enhancedQueryFactory(
    useListStartupsByCreatorQuerySingle,
    ListStartupsByCreatorDocument,
);
export const useListStartupsByIdentityQuery = enhancedQueryFactory(
    useListStartupsByIdentityQuerySingle,
    ListStartupsByIdentityDocument,
);
export const useStartupByIdQuery = enhancedQueryFactory(useStartupByIdQuerySingle, StartupByIdDocument);
export const useListStartupsQuery = enhancedQueryFactory(useListStartupsQuerySingle, ListStartupsDocument);
export const useSearchStartupsQuery = enhancedQueryFactory(useSearchStartupsQuerySingle, SearchStartupsDocument);
export const useMeUserQuery = enhancedQueryFactory(useMeUserQuerySingle, MeUserDocument, (left: MeUserQuery | MeUserQuery[], right: MeUserQuery | MeUserQuery[]) => {
    const leftEntries = Array.isArray(left) ? left : [left];
    const rightEntries = Array.isArray(right) ? right : [right];
    return [...leftEntries, ...rightEntries];
});
export const useCreateCompanyMutation = enhancedMutationFactory(useCreateCompanyMutationSingle, CreateCompanyDocument);
export const useCreateCartMutation = enhancedMutationFactory(useCreateCartMutationSingle, CreateCartDocument);
export const useDeleteCartMutation = enhancedMutationFactory(useDeleteCartMutationSingle, DeleteCartDocument);
export const useUpdateCartMutation = enhancedMutationFactory(useUpdateCartMutationSingle, UpdateCartDocument);
export const useDeleteCompanyMutation = enhancedMutationFactory(useDeleteCompanyMutationSingle, DeleteCompanyDocument);
export const useUpdateCompanyMutation = enhancedMutationFactory(useUpdateCompanyMutationSingle, UpdateCompanyDocument);
export const useCreateCommentMutation = enhancedMutationFactory(useCreateCommentMutationSingle, CreateCommentDocument);
export const useCreateOrderMutation = enhancedMutationFactory(useCreateOrderMutationSingle, CreateOrderDocument);
export const useUpdateOrderMutation = enhancedMutationFactory(useUpdateOrderMutationSingle, UpdateOrderDocument);
export const useCreateReplyToCommentMutation = enhancedMutationFactory(
    useCreateReplyToCommentMutationSingle,
    CreateReplyToCommentDocument,
);
export const useDeleteCommentMutation = enhancedMutationFactory(useDeleteCommentMutationSingle, DeleteCommentDocument);
export const useCreateJobMutation = enhancedMutationFactory(useCreateJobMutationSingle, CreateJobDocument);
export const useDeleteJobMutation = enhancedMutationFactory(useDeleteJobMutationSingle, DeleteJobDocument);
export const useUpdateJobMutation = enhancedMutationFactory(useUpdateJobMutationSingle, UpdateJobDocument);
export const useCreateProductMutation = enhancedMutationFactory(useCreateProductMutationSingle, CreateProductDocument);
export const useDeleteProductMutation = enhancedMutationFactory(useDeleteProductMutationSingle, DeleteProductDocument);
export const useUpdateProductMutation = enhancedMutationFactory(useUpdateProductMutationSingle, UpdateProductDocument);
export const useJoinStartupMutation = enhancedMutationFactory(useJoinStartupMutationSingle, JoinStartupDocument);
export const useLeaveStartupMutation = enhancedMutationFactory(useLeaveStartupMutationSingle, LeaveStartupDocument);
export const useCreateStartupMutation = enhancedMutationFactory(useCreateStartupMutationSingle, CreateStartupDocument);
export const useDeleteStartupMutation = enhancedMutationFactory(useDeleteStartupMutationSingle, DeleteStartupDocument);
export const useUpdateStartupMutation = enhancedMutationFactory(useUpdateStartupMutationSingle, UpdateStartupDocument);
export const useUpdateCommentContentMutation = enhancedMutationFactory(
    useUpdateCommentContentMutationSingle,
    UpdateCommentContentDocument,
);
export const useTrackAnalyticsEventMutation = enhancedMutationFactory(
    useTrackAnalyticsEventMutationSingle,
    TrackAnalyticsEventDocument,
);
export const useUpdateUserByIdMutation = enhancedMutationFactory(
    useUpdateUserByIdMutationSingle,
    UpdateUserByIdDocument,
);
export const useSubscribeToCompanyUpdatesMutation = enhancedMutationFactory(
    useSubscribeToCompanyUpdatesMutationSingle,
    SubscribeToCompanyUpdatesDocument,
);
export const useSubscribeToJobUpdatesMutation = enhancedMutationFactory(
    useSubscribeToJobUpdatesMutationSingle,
    SubscribeToJobUpdatesDocument,
);
export const useSubscribeToProductUpdatesMutation = enhancedMutationFactory(
    useSubscribeToProductUpdatesMutationSingle,
    SubscribeToProductUpdatesDocument,
);
export const useSubscribeToTribeUpdatesMutation = enhancedMutationFactory(
    useSubscribeToTribeUpdatesMutationSingle,
    SubscribeToTribeUpdatesDocument,
);
export const useSubscribeToVentureUpdatesMutation = enhancedMutationFactory(
    useSubscribeToVentureUpdatesMutationSingle,
    SubscribeToVentureUpdatesDocument,
);
export const useUnsubscribeFromCompanyUpdatesMutation = enhancedMutationFactory(
    useUnsubscribeFromCompanyUpdatesMutationSingle,
    UnsubscribeFromCompanyUpdatesDocument,
);
export const useUnsubscribeFromJobUpdatesMutation = enhancedMutationFactory(
    useUnsubscribeFromJobUpdatesMutationSingle,
    UnsubscribeFromJobUpdatesDocument,
);
export const useUnsubscribeFromProductUpdatesMutation = enhancedMutationFactory(
    useUnsubscribeFromProductUpdatesMutationSingle,
    UnsubscribeFromProductUpdatesDocument,
);
export const useUnsubscribeFromTribeUpdatesMutation = enhancedMutationFactory(
    useUnsubscribeFromTribeUpdatesMutationSingle,
    UnsubscribeFromTribeUpdatesDocument,
);
export const useUnsubscribeFromVentureUpdatesMutation = enhancedMutationFactory(
    useUnsubscribeFromVentureUpdatesMutationSingle,
    UnsubscribeFromVentureUpdatesDocument,
);
