export const isMarketAccordionSectionEnabled = (
    query: {
        isLoading: boolean;
    },
    count: number,
    minimumCount = 1,
): boolean => query.isLoading || count >= minimumCount;
