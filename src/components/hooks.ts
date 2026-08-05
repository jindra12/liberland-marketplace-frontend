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
    DislikeCompanyDocument,
    useDislikeCompanyMutation as useDislikeCompanyMutationSingle,
    LikeCompanyDocument,
    useLikeCompanyMutation as useLikeCompanyMutationSingle,
    IdentityByIdDocument,
    useIdentityByIdQuery as useIdentityByIdQuerySingle,
    DislikeIdentityDocument,
    useDislikeIdentityMutation as useDislikeIdentityMutationSingle,
    EntityImageUrlsDocument,
    useEntityImageUrlsQuery as useEntityImageUrlsQuerySingle,
    LikeIdentityDocument,
    useLikeIdentityMutation as useLikeIdentityMutationSingle,
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
    CreateInformationRequestDocument,
    useCreateJobMutation as useCreateJobMutationSingle,
    DeleteJobDocument,
    useDeleteJobMutation as useDeleteJobMutationSingle,
    UpdateJobDocument,
    useUpdateJobMutation as useUpdateJobMutationSingle,
    DislikeJobDocument,
    useDislikeJobMutation as useDislikeJobMutationSingle,
    LikeJobDocument,
    useLikeJobMutation as useLikeJobMutationSingle,
    ListJobsDocument,
    useListJobsQuery as useListJobsQuerySingle,
    SearchJobsDocument,
    useSearchJobsQuery as useSearchJobsQuerySingle,
    CommentByIdDocument,
    useCommentByIdQuery as useCommentByIdQuerySingle,
    ListCommentsByTargetDocument,
    useListCommentsByTargetQuery as useListCommentsByTargetQuerySingle,
    CreateCommentDocument,
    useCreateCommentMutation as useCreateCommentMutationSingle,
    CommentDetailDocument,
    DislikeCommentDocument,
    useDislikeCommentMutation as useDislikeCommentMutationSingle,
    LikeCommentDocument,
    useLikeCommentMutation as useLikeCommentMutationSingle,
    ListCommentRepliesDocument,
    useListCommentRepliesQuery as useListCommentRepliesQuerySingle,
    CreateOrderDocument,
    useCreateOrderMutation as useCreateOrderMutationSingle,
    PostByIdDocument,
    usePostByIdQuery as usePostByIdQuerySingle,
    CreatePostCommentDocument,
    useCreatePostCommentMutation as useCreatePostCommentMutationSingle,
    DeletePostCommentDocument,
    useDeletePostCommentMutation as useDeletePostCommentMutationSingle,
    ListPostCommentsDocument,
    useListPostCommentsQuery as useListPostCommentsQuerySingle,
    ListPostCommentRepliesDocument,
    useListPostCommentRepliesQuery as useListPostCommentRepliesQuerySingle,
    CreatePostReplyCommentDocument,
    useCreatePostReplyCommentMutation as useCreatePostReplyCommentMutationSingle,
    UpdatePostCommentContentDocument,
    useUpdatePostCommentContentMutation as useUpdatePostCommentContentMutationSingle,
    CreatePostDocument,
    useCreatePostMutation as useCreatePostMutationSingle,
    DeletePostDocument,
    useDeletePostMutation as useDeletePostMutationSingle,
    DislikePostDocument,
    useDislikePostMutation as useDislikePostMutationSingle,
    LikePostDocument,
    useLikePostMutation as useLikePostMutationSingle,
    ListPostsDocument,
    useListPostsQuery as useListPostsQuerySingle,
    ListPostsByCompanyDocument,
    useListPostsByCompanyQuery as useListPostsByCompanyQuerySingle,
    SearchPostsDocument,
    useSearchPostsQuery as useSearchPostsQuerySingle,
    UpdatePostDocument,
    useUpdatePostMutation as useUpdatePostMutationSingle,
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
    DislikeProductDocument,
    useDislikeProductMutation as useDislikeProductMutationSingle,
    LikeProductDocument,
    useLikeProductMutation as useLikeProductMutationSingle,
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
    useCreateInformationRequestMutation as useCreateInformationRequestMutationSingle,
    DeleteStartupDocument,
    useDeleteStartupMutation as useDeleteStartupMutationSingle,
    TrackAnalyticsEventDocument,
    useTrackAnalyticsEventMutation as useTrackAnalyticsEventMutationSingle,
    CreateReportDocument,
    useCreateReportMutation as useCreateReportMutationSingle,
    ShareRepostDocument,
    useShareRepostMutation as useShareRepostMutationSingle,
    UpdateStartupDocument,
    useUpdateStartupMutation as useUpdateStartupMutationSingle,
    UpdateOrderDocument,
    useUpdateOrderMutation as useUpdateOrderMutationSingle,
    MeUserDocument,
    useMeUserQuery as useMeUserQuerySingle,
    PermissionsDocument,
    usePermissionsQuery as usePermissionsQuerySingle,
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
    ListPublishedSyndicationUrlsDocument,
    useListPublishedSyndicationUrlsQuery as useListPublishedSyndicationUrlsQuerySingle,
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
    DislikeVentureDocument,
    useDislikeVentureMutation as useDislikeVentureMutationSingle,
    LikeVentureDocument,
    useLikeVentureMutation as useLikeVentureMutationSingle,
    MeUserQuery,
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
    ListPublishedSyndicationUrlsQuery,
    ListPublishedSyndicationUrlsQueryVariables,
    PostByIdQuery,
    PostByIdQueryVariables,
    ProductByIdQuery,
    ProductByIdQueryVariables,
    StartupByIdQuery,
    StartupByIdQueryVariables,
} from "../generated/graphql";
import { BACKEND_URL, gqlFetcher } from "../gqlFetcher";
import { useEndpointContext } from "./EndpointContext";
import {
    anonymizeCartBySecretVariables,
    anonymizeCreateCommentVariables,
    anonymizeCreateCompanyVariables,
    anonymizeCreateJobVariables,
    anonymizeCreateInformationRequestVariables,
    anonymizeCreatePostCommentVariables,
    anonymizeCreatePostReplyCommentVariables,
    anonymizeCreateOrderVariables,
    anonymizeCreateProductVariables,
    anonymizeCreateStartupVariables,
    anonymizeCreateReplyToCommentVariables,
    anonymizeReportVariables,
    anonymizeSubscribeToCompanyUpdatesVariables,
    anonymizeSubscribeToJobUpdatesVariables,
    anonymizeSubscribeToProductUpdatesVariables,
    anonymizeSubscribeToTribeUpdatesVariables,
    anonymizeSubscribeToVentureUpdatesVariables,
    anonymizeUpdateCompanyVariables,
    anonymizeUpdateJobVariables,
    anonymizeUpdateOrderVariables,
    anonymizeUpdateCommentContentVariables,
    anonymizeUpdatePostCommentContentVariables,
    anonymizeCreatePostVariables,
    anonymizeUpdatePostVariables,
    anonymizeUpdateProductVariables,
    anonymizeUpdateStartupVariables,
    anonymizeUpdateUserByIdVariables,
} from "./analytics/anonymizers";
import { combineResult, deepMergeConcatArrays } from "./query/utils";
import { useSortContent } from "./SortContentBySelect/useSortContent";

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
    anonymizer?: (vars: TVariables) => TVariables,
): EnhancedUseMutationHook<TData, TVariables> => {
    const useEnhancedMutation = <TError = unknown, TContext = unknown>(
        options?: Omit<UseMutationOptions<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>, "mutationFn">,
    ) => {
        return useMutation<TData, TError, MutationVariablesWithUrl<TVariables>, TContext>({
            mutationFn: (variables) => {
                const { url, ...rest } = variables;
                return gqlFetcher<TData, TVariables>(mutation, rest as TVariables, undefined, url, anonymizer)();
            },
            ...options,
        });
    };

    useEnhancedMutation.fetcher = (
        variables: MutationVariablesWithUrl<TVariables>,
        options?: RequestInit["headers"],
    ) => {
        const { url, ...rest } = variables;
        return gqlFetcher<TData, TVariables>(mutation, rest as TVariables, options, url, anonymizer);
    };

    return useEnhancedMutation;
};

export const enhancedQueryFactory = <TQueryFnData, TVariables extends object | undefined, TResult = TQueryFnData>(
    useHook: GeneratedUseQueryHook<TQueryFnData, TVariables>,
    query: string,
    hasSort: boolean,
    mergeAction: (a: TQueryFnData, b: TQueryFnData) => TResult = deepMergeConcatArrays,
    anonymizer?: (vars: TVariables) => TVariables,
) => {
    return (
        variables?: QueryVariablesWithUrl<TVariables>,
        params?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
        options?: Headers,
    ) => {
        const { enabled } = useEndpointContext();
        const urls = variables?.url ? [variables.url] : enabled;
        const client = useQueryClient();
        const [value] = useSortContent();

        return useQueries({
            queries: urls.map((url) => ({
                queryKey: [...useHook.getKey(variables as TVariables), url],
                queryFn: gqlFetcher<TQueryFnData, TVariables>(
                    query,
                    (hasSort ? {
                        ...variables,
                        sort: value,
                    } : variables) as TVariables,
                    options,
                    url,
                    anonymizer,
                ),
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
    true,
);
export const useCartBySecretQuery = enhancedQueryFactory(
    useCartBySecretQuerySingle,
    CartBySecretDocument,
    false,
    undefined,
    anonymizeCartBySecretVariables,
);
export const useCompanyByIdQuery = enhancedQueryFactory(useCompanyByIdQuerySingle, CompanyByIdDocument, false);
export const useListCompaniesByIdentityQuery = enhancedQueryFactory(
    useListCompaniesByIdentityQuerySingle,
    ListCompaniesByIdentityDocument,
    true,
);
export const useSearchCompaniesByIdentityQuery = enhancedQueryFactory(
    useSearchCompaniesByIdentityQuerySingle,
    SearchCompaniesByIdentityDocument,
    true,
);
export const useListCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(
    useListCompaniesBySecondaryIdentityQuerySingle,
    ListCompaniesBySecondaryIdentityDocument,
    true,
);
export const useSearchCompaniesBySecondaryIdentityQuery = enhancedQueryFactory(
    useSearchCompaniesBySecondaryIdentityQuerySingle,
    SearchCompaniesBySecondaryIdentityDocument,
    true,
);
export const useListCompaniesQuery = enhancedQueryFactory(useListCompaniesQuerySingle, ListCompaniesDocument, true);
export const useSearchCompaniesQuery = enhancedQueryFactory(useSearchCompaniesQuerySingle, SearchCompaniesDocument, true);
export const useIdentityByIdQuery = enhancedQueryFactory(useIdentityByIdQuerySingle, IdentityByIdDocument, false);
export const useEntityImageUrlsQuery = enhancedQueryFactory(useEntityImageUrlsQuerySingle, EntityImageUrlsDocument, false);
export const useListIdentitiesQuery = enhancedQueryFactory(useListIdentitiesQuerySingle, ListIdentitiesDocument, true);
export const useSearchIdentitiesQuery = enhancedQueryFactory(useSearchIdentitiesQuerySingle, SearchIdentitiesDocument, true);
export const useListJobsByCompanyQuery = enhancedQueryFactory(
    useListJobsByCompanyQuerySingle,
    ListJobsByCompanyDocument,
    true,
);
export const useSearchJobsByCompanyQuery = enhancedQueryFactory(
    useSearchJobsByCompanyQuerySingle,
    SearchJobsByCompanyDocument,
    true,
);
export const useListJobsByCreatorQuery = enhancedQueryFactory(
    useListJobsByCreatorQuerySingle,
    ListJobsByCreatorDocument,
    true,
);
export const useJobByIdQuery = enhancedQueryFactory(useJobByIdQuerySingle, JobByIdDocument, false);
export const useListJobsBySecondaryIdentityQuery = enhancedQueryFactory(
    useListJobsBySecondaryIdentityQuerySingle,
    ListJobsBySecondaryIdentityDocument,
    true,
);
export const useSearchJobsBySecondaryIdentityQuery = enhancedQueryFactory(
    useSearchJobsBySecondaryIdentityQuerySingle,
    SearchJobsBySecondaryIdentityDocument,
    true,
);
export const useListJobsQuery = enhancedQueryFactory(useListJobsQuerySingle, ListJobsDocument, true);
export const useSearchJobsQuery = enhancedQueryFactory(useSearchJobsQuerySingle, SearchJobsDocument, true);
export const useCommentByIdQuery = enhancedQueryFactory(useCommentByIdQuerySingle, CommentByIdDocument, false);
export const useListCommentsByTargetQuery = enhancedQueryFactory(
    useListCommentsByTargetQuerySingle,
    ListCommentsByTargetDocument,
    false,
);
export const useListCommentRepliesQuery = enhancedQueryFactory(
    useListCommentRepliesQuerySingle,
    ListCommentRepliesDocument,
    true,
);
export const useListJobsByIdentityQuery = enhancedQueryFactory(
    useListJobsByIdentityQuerySingle,
    ListJobsByIdentityDocument,
    true,
);
export const useListProductsByIdentityQuery = enhancedQueryFactory(
    useListProductsByIdentityQuerySingle,
    ListProductsByIdentityDocument,
    true,
);
export const useListRepliesToCommentQuery = enhancedQueryFactory(
    useListRepliesToCommentQuerySingle,
    ListRepliesToCommentDocument,
    false,
);
export const useListProductsByCompanyQuery = enhancedQueryFactory(
    useListProductsByCompanyQuerySingle,
    ListProductsByCompanyDocument,
    true,
);
export const useSearchProductsByCompanyQuery = enhancedQueryFactory(
    useSearchProductsByCompanyQuerySingle,
    SearchProductsByCompanyDocument,
    true,
);
export const useListProductsByCreatorQuery = enhancedQueryFactory(
    useListProductsByCreatorQuerySingle,
    ListProductsByCreatorDocument,
    true,
);
export const useProductByIdQuery = enhancedQueryFactory(useProductByIdQuerySingle, ProductByIdDocument, false);
export const useListProductsQuery = enhancedQueryFactory(useListProductsQuerySingle, ListProductsDocument, true);
export const useSearchProductsQuery = enhancedQueryFactory(useSearchProductsQuerySingle, SearchProductsDocument, true);
export const useListStartupsByCompanyQuery = enhancedQueryFactory(
    useListStartupsByCompanyQuerySingle,
    ListStartupsByCompanyDocument,
    true,
);
export const useListStartupsByCreatorQuery = enhancedQueryFactory(
    useListStartupsByCreatorQuerySingle,
    ListStartupsByCreatorDocument,
    true,
);
export const useListStartupsByIdentityQuery = enhancedQueryFactory(
    useListStartupsByIdentityQuerySingle,
    ListStartupsByIdentityDocument,
    true,
);
export const useStartupByIdQuery = enhancedQueryFactory(useStartupByIdQuerySingle, StartupByIdDocument, false);
export const useListStartupsQuery = enhancedQueryFactory(useListStartupsQuerySingle, ListStartupsDocument, true);
export const useSearchStartupsQuery = enhancedQueryFactory(useSearchStartupsQuerySingle, SearchStartupsDocument, true);
export const useListPublishedSyndicationUrlsQuery = enhancedQueryFactory(
    useListPublishedSyndicationUrlsQuerySingle,
    ListPublishedSyndicationUrlsDocument,
    false,
);
export const usePostByIdQuery = enhancedQueryFactory(usePostByIdQuerySingle, PostByIdDocument, false);
export const useListPostCommentsQuery = enhancedQueryFactory(
    useListPostCommentsQuerySingle,
    ListPostCommentsDocument,
    false,
);
export const useListPostCommentRepliesQuery = enhancedQueryFactory(
    useListPostCommentRepliesQuerySingle,
    ListPostCommentRepliesDocument,
    false,
);
export const useListPostsQuery = enhancedQueryFactory(useListPostsQuerySingle, ListPostsDocument, true);
export const useListPostsByCompanyQuery = enhancedQueryFactory(
    useListPostsByCompanyQuerySingle,
    ListPostsByCompanyDocument,
    true,
);
export const useSearchPostsQuery = enhancedQueryFactory(useSearchPostsQuerySingle, SearchPostsDocument, true);
export const useMeUserQuery = enhancedQueryFactory(useMeUserQuerySingle, MeUserDocument, false, (left: MeUserQuery | MeUserQuery[], right: MeUserQuery | MeUserQuery[]) => {
    const leftEntries = Array.isArray(left) ? left : [left];
    const rightEntries = Array.isArray(right) ? right : [right];
    return [...leftEntries, ...rightEntries];
});
export const usePermissionsQuery = enhancedQueryFactory(usePermissionsQuerySingle, PermissionsDocument, false);
export const useCreateCompanyMutation = enhancedMutationFactory(
    useCreateCompanyMutationSingle,
    CreateCompanyDocument,
    anonymizeCreateCompanyVariables,
);
export const useCreateCartMutation = enhancedMutationFactory(useCreateCartMutationSingle, CreateCartDocument);
export const useDeleteCartMutation = enhancedMutationFactory(useDeleteCartMutationSingle, DeleteCartDocument);
export const useUpdateCartMutation = enhancedMutationFactory(useUpdateCartMutationSingle, UpdateCartDocument);
export const useDeleteCompanyMutation = enhancedMutationFactory(useDeleteCompanyMutationSingle, DeleteCompanyDocument);
export const useUpdateCompanyMutation = enhancedMutationFactory(
    useUpdateCompanyMutationSingle,
    UpdateCompanyDocument,
    anonymizeUpdateCompanyVariables,
);
export const useDislikeCompanyMutation = enhancedMutationFactory(
    useDislikeCompanyMutationSingle,
    DislikeCompanyDocument,
);
export const useLikeCompanyMutation = enhancedMutationFactory(useLikeCompanyMutationSingle, LikeCompanyDocument);
export const useCreateCommentMutation = enhancedMutationFactory(
    useCreateCommentMutationSingle,
    CreateCommentDocument,
    anonymizeCreateCommentVariables,
);
export const useDislikeCommentMutation = enhancedMutationFactory(
    useDislikeCommentMutationSingle,
    DislikeCommentDocument,
);
export const useLikeCommentMutation = enhancedMutationFactory(useLikeCommentMutationSingle, LikeCommentDocument);
export const useCreateOrderMutation = enhancedMutationFactory(
    useCreateOrderMutationSingle,
    CreateOrderDocument,
    anonymizeCreateOrderVariables,
);
export const useUpdateOrderMutation = enhancedMutationFactory(
    useUpdateOrderMutationSingle,
    UpdateOrderDocument,
    anonymizeUpdateOrderVariables,
);
export const useCreatePostCommentMutation = enhancedMutationFactory(
    useCreatePostCommentMutationSingle,
    CreatePostCommentDocument,
    anonymizeCreatePostCommentVariables,
);
export const useDeletePostCommentMutation = enhancedMutationFactory(
    useDeletePostCommentMutationSingle,
    DeletePostCommentDocument,
);
export const useCreatePostReplyCommentMutation = enhancedMutationFactory(
    useCreatePostReplyCommentMutationSingle,
    CreatePostReplyCommentDocument,
    anonymizeCreatePostReplyCommentVariables,
);
export const useUpdatePostCommentContentMutation = enhancedMutationFactory(
    useUpdatePostCommentContentMutationSingle,
    UpdatePostCommentContentDocument,
    anonymizeUpdatePostCommentContentVariables,
);
export const useCreatePostMutation = enhancedMutationFactory(
    useCreatePostMutationSingle,
    CreatePostDocument,
    anonymizeCreatePostVariables,
);
export const useDeletePostMutation = enhancedMutationFactory(useDeletePostMutationSingle, DeletePostDocument);
export const useDislikePostMutation = enhancedMutationFactory(useDislikePostMutationSingle, DislikePostDocument);
export const useLikePostMutation = enhancedMutationFactory(useLikePostMutationSingle, LikePostDocument);
export const useUpdatePostMutation = enhancedMutationFactory(
    useUpdatePostMutationSingle,
    UpdatePostDocument,
    anonymizeUpdatePostVariables,
);
export const useCreateReplyToCommentMutation = enhancedMutationFactory(
    useCreateReplyToCommentMutationSingle,
    CreateReplyToCommentDocument,
    anonymizeCreateReplyToCommentVariables,
);
export const useDeleteCommentMutation = enhancedMutationFactory(useDeleteCommentMutationSingle, DeleteCommentDocument);
export const useCreateJobMutation = enhancedMutationFactory(
    useCreateJobMutationSingle,
    CreateJobDocument,
    anonymizeCreateJobVariables,
);
export const useDeleteJobMutation = enhancedMutationFactory(useDeleteJobMutationSingle, DeleteJobDocument);
export const useUpdateJobMutation = enhancedMutationFactory(
    useUpdateJobMutationSingle,
    UpdateJobDocument,
    anonymizeUpdateJobVariables,
);
export const useDislikeJobMutation = enhancedMutationFactory(useDislikeJobMutationSingle, DislikeJobDocument);
export const useLikeJobMutation = enhancedMutationFactory(useLikeJobMutationSingle, LikeJobDocument);
export const useCreateProductMutation = enhancedMutationFactory(
    useCreateProductMutationSingle,
    CreateProductDocument,
    anonymizeCreateProductVariables,
);
export const useDeleteProductMutation = enhancedMutationFactory(useDeleteProductMutationSingle, DeleteProductDocument);
export const useUpdateProductMutation = enhancedMutationFactory(
    useUpdateProductMutationSingle,
    UpdateProductDocument,
    anonymizeUpdateProductVariables,
);
export const useDislikeProductMutation = enhancedMutationFactory(
    useDislikeProductMutationSingle,
    DislikeProductDocument,
);
export const useLikeProductMutation = enhancedMutationFactory(useLikeProductMutationSingle, LikeProductDocument);
export const useJoinStartupMutation = enhancedMutationFactory(useJoinStartupMutationSingle, JoinStartupDocument);
export const useLeaveStartupMutation = enhancedMutationFactory(useLeaveStartupMutationSingle, LeaveStartupDocument);
export const useCreateStartupMutation = enhancedMutationFactory(
    useCreateStartupMutationSingle,
    CreateStartupDocument,
    anonymizeCreateStartupVariables,
);
export const useDeleteStartupMutation = enhancedMutationFactory(useDeleteStartupMutationSingle, DeleteStartupDocument);
export const useUpdateStartupMutation = enhancedMutationFactory(
    useUpdateStartupMutationSingle,
    UpdateStartupDocument,
    anonymizeUpdateStartupVariables,
);
export const useUpdateCommentContentMutation = enhancedMutationFactory(
    useUpdateCommentContentMutationSingle,
    UpdateCommentContentDocument,
    anonymizeUpdateCommentContentVariables,
);
export const useTrackAnalyticsEventMutation = enhancedMutationFactory(
    useTrackAnalyticsEventMutationSingle,
    TrackAnalyticsEventDocument,
);
export const useUpdateUserByIdMutation = enhancedMutationFactory(
    useUpdateUserByIdMutationSingle,
    UpdateUserByIdDocument,
    anonymizeUpdateUserByIdVariables,
);
export const useDislikeIdentityMutation = enhancedMutationFactory(
    useDislikeIdentityMutationSingle,
    DislikeIdentityDocument,
);
export const useLikeIdentityMutation = enhancedMutationFactory(useLikeIdentityMutationSingle, LikeIdentityDocument);
export const useSubscribeToCompanyUpdatesMutation = enhancedMutationFactory(
    useSubscribeToCompanyUpdatesMutationSingle,
    SubscribeToCompanyUpdatesDocument,
    anonymizeSubscribeToCompanyUpdatesVariables,
);
export const useSubscribeToJobUpdatesMutation = enhancedMutationFactory(
    useSubscribeToJobUpdatesMutationSingle,
    SubscribeToJobUpdatesDocument,
    anonymizeSubscribeToJobUpdatesVariables,
);
export const useSubscribeToProductUpdatesMutation = enhancedMutationFactory(
    useSubscribeToProductUpdatesMutationSingle,
    SubscribeToProductUpdatesDocument,
    anonymizeSubscribeToProductUpdatesVariables,
);
export const useSubscribeToTribeUpdatesMutation = enhancedMutationFactory(
    useSubscribeToTribeUpdatesMutationSingle,
    SubscribeToTribeUpdatesDocument,
    anonymizeSubscribeToTribeUpdatesVariables,
);
export const useSubscribeToVentureUpdatesMutation = enhancedMutationFactory(
    useSubscribeToVentureUpdatesMutationSingle,
    SubscribeToVentureUpdatesDocument,
    anonymizeSubscribeToVentureUpdatesVariables,
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
export const useDislikeVentureMutation = enhancedMutationFactory(
    useDislikeVentureMutationSingle,
    DislikeVentureDocument,
);
export const useLikeVentureMutation = enhancedMutationFactory(useLikeVentureMutationSingle, LikeVentureDocument);
export const useCreateReportMutation = enhancedMutationFactory(
    useCreateReportMutationSingle,
    CreateReportDocument,
    anonymizeReportVariables,
);
export const useShareRepostMutation = enhancedMutationFactory(
    useShareRepostMutationSingle,
    ShareRepostDocument,
);
export const useCreateInformationRequestMutation = enhancedMutationFactory(
    useCreateInformationRequestMutationSingle,
    CreateInformationRequestDocument,
    anonymizeCreateInformationRequestVariables,
);

type GraphQLServerResponse<TData> = {
    data?: TData;
    errors?: Array<{
        message: string;
    }>;
};

const createServerQueryFetcher = <TData, TVariables extends object | undefined>(query: string) => {
    return async (variables: TVariables, url?: string, options?: RequestInit["headers"]) => {
        const headers = new Headers(options);
        headers.set("Content-Type", "application/json");

        const response = await fetch(`${url || BACKEND_URL}/api/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as GraphQLServerResponse<TData>;

        if (payload.errors?.length) {
            throw new Error(payload.errors[0].message);
        }

        if (!payload.data) {
            throw new Error("Missing GraphQL data");
        }

        return payload.data;
    };
};

export const fetchCommentDetail = createServerQueryFetcher<CommentDetailQuery, CommentDetailQueryVariables>(
    CommentDetailDocument,
);
export const fetchCompanyById = createServerQueryFetcher<CompanyByIdQuery, CompanyByIdQueryVariables>(
    CompanyByIdDocument,
);
export const fetchIdentityById = createServerQueryFetcher<IdentityByIdQuery, IdentityByIdQueryVariables>(
    IdentityByIdDocument,
);
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
