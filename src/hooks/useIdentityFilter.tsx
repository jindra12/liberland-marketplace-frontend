import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Divider, Typography } from "antd";
import { IdentityFilter } from "../components/IdentityFilter";

interface UseTribeFilterOptions<TItem> {
    allItems: TItem[];
    hasNextPage: boolean;
    getIdentityIds: (item: TItem) => string[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    setPage: (page: number) => void;
}

export function useIdentityFilter<TItem>(options: UseTribeFilterOptions<TItem>) {
    const { allItems, hasNextPage, getIdentityIds, isLoading, isFetching, page, setPage } = options;

    const [searchParams] = useSearchParams();
    const tribeParam = searchParams.get("tribe");
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>(tribeParam ? [tribeParam] : []);

    const isTribeFiltered = selectedIdentityIds.length > 0;

    const items = isTribeFiltered
        ? allItems.filter((item) => {
              const ids = getIdentityIds(item);
              return selectedIdentityIds.some((id) => ids.includes(id));
          })
        : allItems;

    // Auto-fetch next page when tribe filter yields 0 visible items but more pages exist
    React.useEffect(() => {
        if (isTribeFiltered && items.length === 0 && hasNextPage && !isLoading && !isFetching) {
            setPage(page + 1);
        }
    }, [isTribeFiltered, items.length, hasNextPage, isLoading, isFetching, page, setPage]);

    const endMessage =
        isTribeFiltered && !hasNextPage ? (
            <div className="AppList__tribeEnd">
                <Divider />
                <Typography.Title level={4} className="AppList__tribeEndHeading">
                    No more results for this Tribe
                </Typography.Title>
                <Button type="primary" size="large" href={window.location.pathname}>
                    View items from all tribes
                </Button>
            </div>
        ) : undefined;

    const filterNode = <IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />;

    return { items, hasMore: hasNextPage, endMessage, filterNode };
}
