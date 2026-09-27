export type OptionalDetailDataParams = {
    id?: string;
    serverUrl?: string;
};

export type OptionalDetailDataFetcher<TEntity, TExtra> = (
    entity: TEntity,
    params: OptionalDetailDataParams,
    serverUrl: string,
) => Promise<TExtra> | TExtra;

export const fetchOptionalDetailData = async <TEntity, TExtra>(
    fetcher: OptionalDetailDataFetcher<TEntity, TExtra> | undefined,
    entity: TEntity,
    params: OptionalDetailDataParams,
    serverUrl: string,
): Promise<TExtra | undefined> => {
    if (!fetcher) {
        return undefined;
    }

    try {
        return await fetcher(entity, params, serverUrl);
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
