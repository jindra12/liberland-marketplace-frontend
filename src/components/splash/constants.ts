export const MARKET_ACCORDION_POSTS_QUERY_LIMIT = 20;

export const MARKET_ACCORDION_POST_SLICES = [
    { key: "top", offset: 0, limit: 2, className: "MarketAccordion__postSection--top" },
    { key: "firstMiddle", offset: 2, limit: 3, className: "MarketAccordion__postSection--firstMiddle" },
    { key: "secondMiddle", offset: 5, limit: 3, className: "MarketAccordion__postSection--secondMiddle" },
    { key: "thirdMiddle", offset: 8, limit: 4, className: "MarketAccordion__postSection--thirdMiddle" },
] as const;

export const MARKET_ACCORDION_POSTS_REST_OFFSET = 12;
