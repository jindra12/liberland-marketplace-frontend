import type {
    FetchStatus,
    QueryObserverResult,
    QueryStatus,
    RefetchOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import mergeWith from "lodash-es/mergeWith";

type QueryResult<TData> = UseQueryResult<TData, Error>;

const getMaxQueryMetric = <TData>(
    results: readonly QueryResult<TData>[],
    selector: (result: QueryResult<TData>) => number,
): number => {
    return results.reduce((maxMetric, result) => {
        const metric = selector(result);
        return metric > maxMetric ? metric : maxMetric;
    }, 0);
};

const mergeQueryData = <TQuery, TResult>(
    values: TQuery[],
    mergeAction: (left: TQuery | TResult, right: TQuery | TResult) => TResult,
): TQuery | TResult | undefined => {
    if (values.length === 0) {
        return undefined;
    }

    const [firstValue, ...remainingValues] = values;

    return remainingValues.reduce<TQuery | TResult>((currentValue, value) => {
        return mergeAction(currentValue, value);
    }, firstValue);
};

export const deepMergeConcatArrays = <T>(left: T, right: T): T => {
    return mergeWith({}, left, right, (leftValue: unknown, rightValue: unknown) => {
        if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
            return [...leftValue, ...rightValue];
        }

        return undefined;
    }) as T;
};

export const combineResult = <TQuery, TResult = TQuery>(
    results: readonly QueryResult<TQuery>[],
    mergeAction: (left: TQuery | TResult, right: TQuery | TResult) => TResult,
): QueryResult<TResult> => {
    const dataValues = results.flatMap((result) => {
        return result.data === undefined ? [] : [result.data];
    });
    const data = mergeQueryData(dataValues, mergeAction);
    const isError = results.length > 0 && results.every((query) => query.isError);
    const isPending = results.length > 0 && results.every((query) => query.isPending);
    const isLoading = results.length > 0 && results.every((query) => query.isLoading);
    const isFetching = results.length > 0 && results.every((query) => query.isFetching);
    const isFetched = results.some((query) => query.isFetched);
    const isFetchedAfterMount = results.some((query) => query.isFetchedAfterMount);
    const isPaused = results.some((query) => query.isPaused);
    const isPlaceholderData = results.some((query) => query.isPlaceholderData);
    const isStale = results.some((query) => query.isStale);
    const isSuccess = results.length > 0 && results.every((query) => query.isSuccess);
    const status: QueryStatus = isPending ? "pending" : isError ? "error" : "success";
    const fetchStatus: FetchStatus = isFetching ? "fetching" : isPaused ? "paused" : "idle";
    const hasData = Array.isArray(data) ? data.length > 0 : data !== undefined;
    const error = isError ? results.find((query) => query.error)?.error : undefined;
    const failureReason = results.find((query) => query.failureReason !== undefined)?.failureReason;

    const refetch = async (options?: RefetchOptions): Promise<QueryObserverResult<TResult, Error>> => {
        const refetched = await Promise.all(results.map((query) => query.refetch(options)));
        return combineResult(refetched, mergeAction);
    };

    return {
        data,
        dataUpdatedAt: getMaxQueryMetric(results, (query) => query.dataUpdatedAt),
        error,
        errorUpdateCount: results.reduce((sum, query) => sum + query.errorUpdateCount, 0),
        errorUpdatedAt: getMaxQueryMetric(results, (query) => query.errorUpdatedAt),
        failureCount: results.reduce((sum, query) => sum + query.failureCount, 0),
        failureReason,
        fetchStatus,
        isError,
        isFetched,
        isFetchedAfterMount,
        isFetching,
        isInitialLoading: isLoading,
        isLoading,
        isLoadingError: isError && !hasData,
        isPaused,
        isPending,
        isPlaceholderData,
        isRefetchError: isError && hasData,
        isRefetching: isFetching && !isPending,
        isStale,
        isSuccess,
        refetch,
        status,
    } as QueryResult<TResult>;
};
