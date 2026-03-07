import {
    QueryKey,
    useMutation,
    useQueries,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import {
    CartBySecretDocument,
    useCartBySecretQuery as useCartBySecretQuerySingle,
    CreateCartDocument,
    useCreateCartMutation as useCreateCartMutationSingle,
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
    UpdateStartupDocument,
    useUpdateStartupMutation as useUpdateStartupMutationSingle,
    UpdateOrderDocument,
    useUpdateOrderMutation as useUpdateOrderMutationSingle,
    type UpdateOrderMutation,
    type UpdateOrderMutationVariables,
} from "../generated/graphql";
import { gqlFetcher } from "../gqlFetcher";
import { useEndpointContext } from "./EndpointContext";
import { combineResult, deepMergeConcatArrays } from "../utils";

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

type UpdateOrderMutationVariablesWithSecret = UpdateOrderMutationVariables & { secret: string };

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
};

export const useListCompaniesByCreatorQuery = enhancedQueryFactory(useListCompaniesByCreatorQuerySingle, ListCompaniesByCreatorDocument);
export const useCartBySecretQuery = enhancedQueryFactory(useCartBySecretQuerySingle, CartBySecretDocument);
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
export const useListStartupsByIdentityQuery = enhancedQueryFactory(useListStartupsByIdentityQuerySingle, ListStartupsByIdentityDocument);
export const useStartupByIdQuery = enhancedQueryFactory(useStartupByIdQuerySingle, StartupByIdDocument);
export const useListStartupsQuery = enhancedQueryFactory(useListStartupsQuerySingle, ListStartupsDocument);
export const useSearchStartupsQuery = enhancedQueryFactory(useSearchStartupsQuerySingle, SearchStartupsDocument);
export const useCreateCompanyMutation = enhancedMutationFactory(useCreateCompanyMutationSingle, CreateCompanyDocument);
export const useCreateCartMutation = enhancedMutationFactory(useCreateCartMutationSingle, CreateCartDocument);
export const useUpdateCartMutation = enhancedMutationFactory(useUpdateCartMutationSingle, UpdateCartDocument);
export const useDeleteCompanyMutation = enhancedMutationFactory(useDeleteCompanyMutationSingle, DeleteCompanyDocument);
export const useUpdateCompanyMutation = enhancedMutationFactory(useUpdateCompanyMutationSingle, UpdateCompanyDocument);
export const useCreateCommentMutation = enhancedMutationFactory(useCreateCommentMutationSingle, CreateCommentDocument);
export const useCreateOrderMutation = enhancedMutationFactory(useCreateOrderMutationSingle, CreateOrderDocument);
export const useUpdateOrderMutation = enhancedMutationFactory(
    useUpdateOrderMutationSingle as unknown as GeneratedUseMutationHook<
        UpdateOrderMutation,
        UpdateOrderMutationVariablesWithSecret
    >,
    UpdateOrderDocument,
);
export const useCreateReplyToCommentMutation = enhancedMutationFactory(useCreateReplyToCommentMutationSingle, CreateReplyToCommentDocument);
export const useDeleteCommentMutation = enhancedMutationFactory(useDeleteCommentMutationSingle, DeleteCommentDocument);
export const useCreateJobMutation = enhancedMutationFactory(useCreateJobMutationSingle, CreateJobDocument);
export const useDeleteJobMutation = enhancedMutationFactory(useDeleteJobMutationSingle, DeleteJobDocument);
export const useUpdateJobMutation = enhancedMutationFactory(useUpdateJobMutationSingle, UpdateJobDocument);
export const useCreateProductMutation = enhancedMutationFactory(useCreateProductMutationSingle, CreateProductDocument);
export const useDeleteProductMutation = enhancedMutationFactory(useDeleteProductMutationSingle, DeleteProductDocument);
export const useUpdateProductMutation = enhancedMutationFactory(useUpdateProductMutationSingle, UpdateProductDocument);
export const useCreateStartupMutation = enhancedMutationFactory(useCreateStartupMutationSingle, CreateStartupDocument);
export const useDeleteStartupMutation = enhancedMutationFactory(useDeleteStartupMutationSingle, DeleteStartupDocument);
export const useUpdateStartupMutation = enhancedMutationFactory(useUpdateStartupMutationSingle, UpdateStartupDocument);
export const useUpdateCommentContentMutation = enhancedMutationFactory(useUpdateCommentContentMutationSingle, UpdateCommentContentDocument);
